// Hybrid translation: Try Google GTX API first, fallback to manual translation (Google priority)

const translationCache = new Map();

/**
 * Clean HTML tags from text
 */
function cleanHTMLTags(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}

/**
 * Try Google GTX API (Free endpoint used by extensions)
 */
async function tryGoogleGTXAPI(text) {
    const cleanText = cleanHTMLTags(text);
    if (!cleanText) return null;

    // Check cache
    const cacheKey = `zh:${cleanText.substring(0, 100)}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    try {
        // Google Translate GTX endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(cleanText)}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`Google GTX API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Parse Google's array format: [[["Translated", "Original", ...], ...], ...]
        if (data && data[0]) {
            let translatedText = '';
            data[0].forEach(part => {
                if (part[0]) translatedText += part[0];
            });

            if (translatedText) {
                // Cache result
                translationCache.set(cacheKey, translatedText);
                return translatedText;
            }
        }

        return null;
    } catch (error) {
        console.warn('Google GTX API failed:', error.message);
        return null;
    }
}

/**
 * Show manual translation options (Google First)
 */
export async function showManualTranslationOptions(title, abstract) {
    const fullText = `标题：${title}\n\n摘要：${abstract}`;

    // Copy to clipboard
    const copied = await copyToClipboard(fullText);

    if (!copied) {
        alert('复制失败，请手动选择文本复制');
        return;
    }

    // Show options
    const message =
        '⚠️ 自动翻译服务暂时不可用\n\n' +
        '✅ 文本已复制到剪贴板！\n\n' +
        '请选择翻译工具：\n\n' +
        '确定：Google翻译（推荐，速度快）\n' +
        '取消：DeepL翻译（质量好，但可能卡顿）';

    const useGoogle = window.confirm(message);

    if (useGoogle) {
        // Open Google Translate
        window.open('https://translate.google.com/?sl=en&tl=zh-CN&op=translate', '_blank');
        setTimeout(() => {
            alert(
                '💡 使用提示\n\n' +
                '1. Google翻译页面已打开\n' +
                '2. 文本已在剪贴板中\n' +
                '3. 在左侧输入框中按 Ctrl+V 粘贴\n' +
                '4. 右侧即可看到中文翻译'
            );
        }, 500);
    } else {
        // Open DeepL
        window.open('https://www.deepl.com/translator#en/zh/', '_blank');
        setTimeout(() => {
            alert(
                '💡 使用提示\n\n' +
                '1. DeepL翻译页面已打开\n' +
                '2. 文本已在剪贴板中\n' +
                '3. 在左侧输入框中按 Ctrl+V 粘贴\n' +
                '4. 右侧即可看到中文翻译'
            );
        }, 500);
    }
}

/**
 * Main translation function
 * Priority: Google GTX API -> Manual translation
 */
export async function translateText(title, abstract) {
    try {
        // Step 1: Try Google GTX API for both title and abstract
        console.log('尝试使用Google GTX API翻译...');

        const [translatedTitle, translatedAbstract] = await Promise.all([
            tryGoogleGTXAPI(title),
            tryGoogleGTXAPI(abstract)
        ]);

        // If both succeeded
        if (translatedTitle && translatedAbstract) {
            console.log('API翻译成功！');
            alert(
                '✅ 翻译成功！\n\n' +
                `📌 标题：\n${translatedTitle}\n\n` +
                `📄 摘要：\n${translatedAbstract}\n\n` +
                '💡 提示：建议使用浏览器右键"翻译成中文"功能查看完整页面翻译'
            );

            return {
                success: true,
                title: translatedTitle,
                abstract: translatedAbstract,
                source: 'Google GTX API'
            };
        }

        // Step 2: API failed, use manual translation
        console.log('API翻译失败，使用手动翻译流程...');
        await showManualTranslationOptions(title, abstract);

        return {
            success: false,
            usedManual: true
        };

    } catch (error) {
        console.error('Translation error:', error);
        // Fallback to manual
        await showManualTranslationOptions(title, abstract);

        return {
            success: false,
            usedManual: true,
            error: error.message
        };
    }
}

/**
 * Show browser translation guide
 */
export function showBrowserTranslationGuide() {
    alert(
        '📖 推荐翻译方式\n\n' +
        '🔥 方法一：浏览器内置翻译 (最简单)\n' +
        '   • 右键任意位置 → "翻译成中文"\n' +
        '   • 或点击地址栏的翻译图标🌐\n' +
        '   • 整个页面都会被翻译！\n\n' +
        '🌟 方法二：在线工具\n' +
        '   • Google翻译: https://translate.google.com (推荐)\n' +
        '   • DeepL: https://www.deepl.com\n\n' +
        '💡 方法三：浏览器扩展\n' +
        '   • 划词翻译\n' +
        '   • 沙拉查词'
    );
}

export default {
    translateText,
    showManualTranslationOptions,
    showBrowserTranslationGuide,
    copyToClipboard,
};
