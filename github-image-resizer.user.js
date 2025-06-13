// ==UserScript==
// @name         GitHub Image Resizer
// @namespace    http://miked49er.github.io/
// @version      1.4
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

    const imageMarkdownRegex = /!\[(.*?)\]\((https:\/\/(?:(private|)user-images\.githubusercontent\.com|github\.com\/user-attachments\/assets)\/[^\)]+)\)/g;

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
    }

    function monitorTextarea(textarea) {
        if (textarea.dataset.monitored) return;
        textarea.dataset.monitored = "true";

        // Check initial content
        replaceImagesInTextarea(textarea);

        // MutationObserver for DOM changes (not .value though!)
        const observer = new MutationObserver(() => {
            replaceImagesInTextarea(textarea);
        });

        observer.observe(textarea, { characterData: true, childList: true, subtree: true });

        // Input still useful for typing/paste
        textarea.addEventListener('input', () => replaceImagesInTextarea(textarea));

        // 🧠 Polling loop to detect programmatic .value changes (used by drag-drop)
        let lastValue = textarea.value;
        setInterval(() => {
            if (textarea.value !== lastValue) {
                lastValue = textarea.value;
                replaceImagesInTextarea(textarea);
            }
        }, 800);
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
