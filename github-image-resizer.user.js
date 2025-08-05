// ==UserScript==
// @name         GitHub Image Resizer
// @namespace    http://miked49er.github.io/
// @version      1.8
// @description  Convert GitHub markdown image uploads to HTML <img> tags with customizable width; supports drag-drop, paste, and attachment button uploads.
// @author       Mike Deiters
// @match        https://github.com/*
// @license      MIT
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @updateURL   https://raw.githubusercontent.com/miked49er/github-image-resizer/refs/heads/main/github-image-resizer.user.js
// @downloadURL https://raw.githubusercontent.com/miked49er/github-image-resizer/refs/heads/main/github-image-resizer.user.js
// ==/UserScript==

(function () {
    'use strict';

    const DEFAULT_WIDTH = 300;

    function getWidth() {
        return GM_getValue('imageWidth', DEFAULT_WIDTH);
    }

    function setWidth() {
        const current = getWidth();
        const input = prompt('Enter desired image width in px (number only):', current);
        const value = parseInt(input, 10);
        if (!isNaN(value) && value > 0) {
            GM_setValue('imageWidth', value);
            alert(`Image width set to ${value}px`);
        } else {
            alert('Invalid width.');
        }
    }

    GM_registerMenuCommand('Set Image Width', setWidth);

    const imageMarkdownRegex = /!\[(.*?)\]\((https:\/\/(?:(private-|)user-images\.githubusercontent\.com|github\.com\/user-attachments\/assets)\/[^\)]+)\)/g;

    function adjustExistingImgTags(textarea) {
        let content = textarea.value;
        let modified = false;
        const width = getWidth();

        // Match GitHub-hosted <img> tags (self-closing or not)
        const htmlImgRegex = /<img\s+([^>]*?)\s*(\/?)>/gi;

        content = content.replace(htmlImgRegex, (match, attrString, selfClosingSlash) => {
            const hasGitHubSrc = /src=["']https:\/\/(?:(private-)?user-images\.githubusercontent\.com|github\.com\/user-attachments\/assets)\/[^"']+["']/i.test(attrString);
            if (!hasGitHubSrc) return match;

            // Remove existing width and height
            let updatedAttrs = attrString
                .replace(/width=["'][^"']*["']/i, '')
                .replace(/height=["'][^"']*["']/i, '')
                .replace(/\s*\/$/, '') // remove any trailing /
                .trim();

            updatedAttrs += ` width="${width}"`;

            const closing = selfClosingSlash === '/' ? ' />' : '>';
            modified = true;
            return `<img ${updatedAttrs}${closing}`;
        });

        if (modified) {
            textarea.value = content;
        }
    }


    function replaceImagesInTextarea(textarea) {
        let content = textarea.value;
        let modified = false;

        const width = getWidth();

        content = content.replace(imageMarkdownRegex, (match, alt, url) => {
            modified = true;
            return `<img src="${url}" alt="${alt}" width="${width}">`;
        });

        if (modified) {
            textarea.value = content;
        }

        adjustExistingImgTags(textarea);
    }

    function monitorTextarea(textarea) {
        if (textarea.dataset.monitored) return;
        textarea.dataset.monitored = "true";

        // Check initial content
        replaceImagesInTextarea(textarea);

        // Input event for typing/paste
        textarea.addEventListener('input', (e) => {
            // Only process if the content contains an image markdown
            if (imageMarkdownRegex.test(textarea.value)) {
                replaceImagesInTextarea(textarea);
            }
        });

        // Reduce polling frequency and only check when necessary
        let lastValue = textarea.value;
        setInterval(() => {
            const currentValue = textarea.value;
            if (currentValue !== lastValue) {
                lastValue = currentValue;
                replaceImagesInTextarea(textarea);
            }
        }, 1000); // Increased from 800ms to 1000ms for less interference
    }


    function observeDynamicTextareas() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const textareas = node.querySelectorAll('textarea');
                        textareas.forEach(monitorTextarea);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Initial load
        document.querySelectorAll('textarea').forEach(monitorTextarea);
    }

    function hookAttachmentButton() {
        // Handle pasted content
        document.body.addEventListener('paste', () => {
            setTimeout(() => {
                document.querySelectorAll('textarea').forEach(replaceImagesInTextarea);
            }, 500);
        });

        // Handle manual typing or JS-inserted content
        document.body.addEventListener('input', (e) => {
            if (e.target.tagName === 'TEXTAREA') {
                setTimeout(() => replaceImagesInTextarea(e.target), 500);
            }
        });

        // Handle drag-and-drop image uploads
        document.body.addEventListener('drop', (e) => {
            const textarea = e.target.closest('textarea');
            if (textarea) {
                setTimeout(() => {
                    replaceImagesInTextarea(textarea);
                }, 1500); // Wait for upload + Markdown injection
            }
        });

        // Handle file input via attachment button
        document.body.addEventListener('change', (e) => {
            if (e.target.type === 'file') {
                setTimeout(() => {
                    document.querySelectorAll('textarea').forEach(replaceImagesInTextarea);
                }, 1000);
            }
        });
    }

    observeDynamicTextareas();
    hookAttachmentButton();
})();
