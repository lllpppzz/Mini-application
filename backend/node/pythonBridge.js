const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute a Python script and return the result
 * @param {string} scriptName - Name of the Python script (without .py)
 * @param {Array} args - Command line arguments
 * @param {Object} stdinData - Data to send to stdin (will be JSON stringified)
 * @returns {Promise} - Promise that resolves with the script output
 */
async function executePythonScript(scriptName, args = [], stdinData = null) {
    return new Promise((resolve, reject) => {
        const { app } = require('electron');
        const isPackaged = app.isPackaged;
        const useSimplified = scriptName === 'similarity';

        let scriptDir;
        let pythonExecutable = 'python';

        if (isPackaged) {
            // Production: Use bundled Python and scripts
            const resourcesPath = process.resourcesPath;
            scriptDir = path.join(resourcesPath, 'python-scripts');
            pythonExecutable = path.join(resourcesPath, 'python-env', 'python.exe');
            console.log('[PythonBridge] Running in packaged mode');
            console.log('[PythonBridge] Python path:', pythonExecutable);
            console.log('[PythonBridge] Script dir:', scriptDir);
        } else {
            // Development: Use local scripts and system/env Python
            scriptDir = path.join(__dirname, '../python');

            if (process.platform === 'win32') {
                const { execSync } = require('child_process');
                const fs = require('fs');

                const yolov7Python = 'D:\\lxk\\envs\\yolov7\\python.exe';
                if (fs.existsSync(yolov7Python)) {
                    pythonExecutable = yolov7Python;
                    console.log('[PythonBridge] Using yolov7 Python:', pythonExecutable);
                } else {
                    try {
                        const output = execSync('where python', { encoding: 'utf-8' });
                        const pythonPath = output.split('\n')[0].trim().replace(/\r/g, '');
                        if (pythonPath && pythonPath.length > 0) {
                            pythonExecutable = pythonPath;
                            console.log('[PythonBridge] Using system Python:', pythonExecutable);
                        }
                    } catch (e) {
                        console.log('[PythonBridge] Using default python command');
                    }
                }
            }
        }

        const scriptPath = path.join(scriptDir, useSimplified ? 'similarity_simple.py' : `${scriptName}.py`);

        const pythonProcess = spawn(pythonExecutable, [scriptPath, ...args], {
            cwd: scriptDir,
        });

        let stdout = '';
        let stderr = '';

        console.log(`[PythonBridge] Executing ${useSimplified ? 'similarity_simple' : scriptName} with args:`, args);

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
            console.log(`[PythonBridge] ${scriptName} stderr:`, data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[PythonBridge] ${scriptName} failed with code ${code}`);
                console.error(`[PythonBridge] stderr: ${stderr}`);
                reject(new Error(`Python script failed with code ${code}: ${stderr}`));
                return;
            }

            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (error) {
                console.error(`[PythonBridge] Failed to parse JSON from ${scriptName}`);
                console.error(`[PythonBridge] Raw output:`, stdout);
                reject(new Error(`Failed to parse Python output: ${error.message}\nOutput: ${stdout}`));
            }
        });

        pythonProcess.on('error', (error) => {
            reject(new Error(`Failed to start Python process: ${error.message}`));
        });

        if (stdinData) {
            pythonProcess.stdin.write(JSON.stringify(stdinData));
            pythonProcess.stdin.end();
        }
    });
}

async function parsePDF(filePath) {
    try {
        const result = await executePythonScript('pdf_parser', [filePath]);
        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

async function calculateSimilarity(referenceTexts, candidateTexts) {
    try {
        const result = await executePythonScript('similarity', [], {
            mode: 'similarity',
            reference_texts: referenceTexts,
            candidate_texts: candidateTexts,
        });
        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

async function extractKeywords(texts, topN = 20) {
    try {
        const result = await executePythonScript('similarity', [], {
            mode: 'keywords',
            texts: texts,
            top_n: topN,
        });
        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

async function translateText(text, target = 'zh-CN') {
    try {
        const result = await executePythonScript('translator', [], {
            text,
            target
        });
        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

module.exports = {
    executePythonScript,
    parsePDF,
    calculateSimilarity,
    extractKeywords,
    translateText
};
