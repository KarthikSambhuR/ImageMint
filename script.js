document.addEventListener('DOMContentLoaded', () => {

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseButton = document.getElementById('browse-button');
    const imagePreviews = document.getElementById('image-previews');
    const imageCardTemplate = document.getElementById('image-card-template');
    const controlsArea = document.getElementById('controls-area');
    const outputFormatSelect = document.getElementById('output-format');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const qualityControl = document.getElementById('quality-control');
    const resizeModeSelect = document.getElementById('resize-mode');
    const resizeInputs = document.getElementById('resize-inputs');
    const resizeWidthInput = document.getElementById('resize-width');
    const resizeHeightInput = document.getElementById('resize-height');
    const resizeUnitLabel = document.getElementById('resize-unit-label');
    const targetSizeInput = document.getElementById('target-size');
    const targetSizeUnitSelect = document.getElementById('target-size-unit');
    const convertAllButton = document.getElementById('convert-all-button');
    const notifications = document.getElementById('notifications');
    const globalProgressContainer = document.getElementById('global-progress');
    const globalProgressBar = globalProgressContainer.querySelector('.progress-bar');
    const globalProgressText = globalProgressContainer.querySelector('.progress-text');

    let imageFiles = []; 

    const MB = 1024 * 1024;
    const KB = 1024;

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'; 
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const showNotification = (message, type = 'info', duration = 4000) => {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        notifications.appendChild(notification);

        notification.offsetHeight;

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');

            notification.addEventListener('transitionend', () => notification.remove(), { once: true });
        }, duration);
    };

    const generateId = () => `img_${Math.random().toString(36).substr(2, 9)}`;

    const getTargetSizeInBytes = () => {
        const size = parseFloat(targetSizeInput.value);
        if (isNaN(size) || size <= 0) return null;
        const unit = targetSizeUnitSelect.value;
        return unit === 'MB' ? size * MB : size * KB;
    };

    const saveSettings = () => {
        try {
            const settings = {
                outputFormat: outputFormatSelect.value,
                quality: qualitySlider.value,
                resizeMode: resizeModeSelect.value,
                resizeWidth: resizeWidthInput.value,
                resizeHeight: resizeHeightInput.value,
                targetSize: targetSizeInput.value,
                targetSizeUnit: targetSizeUnitSelect.value,
            };
            localStorage.setItem('imageMintSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn("Could not save settings to localStorage:", e);

        }
    };

    const loadSettings = () => {
        try {
            const settings = JSON.parse(localStorage.getItem('imageMintSettings'));
            if (settings) {
                outputFormatSelect.value = settings.outputFormat || 'image/jpeg'; 
                qualitySlider.value = settings.quality || '0.85';
                resizeModeSelect.value = settings.resizeMode || 'none';
                resizeWidthInput.value = settings.resizeWidth || '';
                resizeHeightInput.value = settings.resizeHeight || '';
                targetSizeInput.value = settings.targetSize || '';
                targetSizeUnitSelect.value = settings.targetSizeUnit || 'KB';
            }
        } catch (e) {
            console.warn("Could not load settings from localStorage:", e);

             outputFormatSelect.value = 'image/jpeg';
             qualitySlider.value = '0.85';
             resizeModeSelect.value = 'none';
        }

        updateQualityDisplay();
        toggleQualityControl();
        toggleResizeInputs();
    };

    const updateQualityDisplay = () => {
        qualityValue.textContent = `${Math.round(qualitySlider.value * 100)}%`;
    };

    const toggleQualityControl = () => {
        const format = outputFormatSelect.value;

        qualityControl.style.display = (format === 'image/jpeg' || format === 'image/webp') ? 'flex' : 'none';
    };

    const toggleResizeInputs = () => {
        const mode = resizeModeSelect.value;
        const show = mode === 'pixels' || mode === 'percentage';
        resizeInputs.style.display = show ? 'flex' : 'none';

        if (show) {
            if (mode === 'percentage') {
                resizeUnitLabel.textContent = '%';
                resizeWidthInput.placeholder = 'Percentage (%)';
                resizeHeightInput.style.display = 'none'; 

                resizeHeightInput.value = ''; 
            } else { 
                resizeUnitLabel.textContent = 'px';
                resizeWidthInput.placeholder = 'Width (px)';
                resizeHeightInput.placeholder = 'Height (px)';
                resizeHeightInput.style.display = 'inline-block'; 

            }
        } else { 
             resizeWidthInput.value = '';
             resizeHeightInput.value = '';
        }
    };

     const updateConvertButtonState = () => {
        const hasFiles = imageFiles.length > 0;
        convertAllButton.disabled = !hasFiles;

        if (hasFiles && !controlsArea.classList.contains('visible')) {
             controlsArea.style.display = 'block'; 

             controlsArea.offsetHeight;
             controlsArea.classList.add('visible');
        } else if (!hasFiles && controlsArea.classList.contains('visible')) {
             controlsArea.classList.remove('visible');

             const handleTransitionEnd = () => {
                 if (!controlsArea.classList.contains('visible')) {
                     controlsArea.style.display = 'none';
                 }
                 controlsArea.removeEventListener('transitionend', handleTransitionEnd);
             };
             controlsArea.addEventListener('transitionend', handleTransitionEnd);
        } else if (!hasFiles) {

             controlsArea.style.display = 'none';
        }
     };

    const updateCardProgress = (cardElement, percentage, text = '') => {
        const progressBar = cardElement.querySelector('.progress-bar');
        const progressContainer = cardElement.querySelector('.card-progress');
        if (!progressContainer || !progressBar) return; 

        if (percentage !== null && percentage >= 0) {
            progressContainer.style.display = 'block';
            progressBar.style.width = `${Math.min(100, percentage)}%`; 
        } else {

             progressBar.style.width = '0%';
             setTimeout(() => {
                if (progressBar.style.width === '0%') { 
                    progressContainer.style.display = 'none';
                }
             }, 500); 
        }
    };

    const updateGlobalProgress = (percentage, text = 'Processing...') => {
         if (percentage !== null && percentage >= 0) {
             globalProgressContainer.style.display = 'block';
             globalProgressBar.style.width = `${Math.min(100, percentage)}%`;
             globalProgressText.textContent = text;
             globalProgressText.style.opacity = '1'; 
         } else {

             globalProgressBar.style.width = '0%';
             globalProgressText.style.opacity = '0';
             setTimeout(() => {
                if (globalProgressBar.style.width === '0%') { 
                     globalProgressContainer.style.display = 'none';
                }
             }, 500); 
         }
     };

    const showCardOutputInfo = (cardElement, blob, filename) => {
        const outputInfo = cardElement.querySelector('.output-info');
        const outputDetails = cardElement.querySelector('.output-details');
        const downloadBtn = cardElement.querySelector('.download-btn');

        if (!outputInfo || !outputDetails || !downloadBtn) return; 

        if (blob && filename) {
            outputDetails.textContent = `${filename} (${formatBytes(blob.size)})`;
            outputInfo.style.display = 'block'; 
            downloadBtn.style.display = 'inline-flex';

            const newDownloadBtn = downloadBtn.cloneNode(true); 
            newDownloadBtn.onclick = () => triggerDownload(blob, filename);
            downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);

        } else {
            outputInfo.style.display = 'none';
            downloadBtn.style.display = 'none';
            downloadBtn.onclick = null; 
        }
    };

    const handleFiles = (inputFiles) => {
        if (!inputFiles || inputFiles.length === 0) return;
        dropZone.classList.add('uploading');

        let processedCount = 0;
        const filesToAdd = Array.from(inputFiles); 
        const totalFiles = filesToAdd.length;
        let isFirstFileOverall = imageFiles.length === 0; 

        updateGlobalProgress(0, `Loading 0/${totalFiles} images...`);

        const processSingleFile = (file) => {
            return new Promise((resolve, reject) => {
                if (!file || !file.type.startsWith('image/')) {
                    showNotification(`Skipped non-image file: ${file?.name || 'Unknown'}`, 'error');
                    resolve(false); 
                    return;
                }
                if (file.size === 0) {
                    showNotification(`Skipped empty file: ${file.name}`, 'error');
                    resolve(false);
                    return;
                }

                if (imageFiles.some(existing => existing.file.name === file.name && existing.file.size === file.size)) {
                    showNotification(`Skipped duplicate file: ${file.name}`, 'info');
                    resolve(false);
                    return;
                }

                const reader = new FileReader();
                const imageId = generateId();

                reader.onload = (e) => {
                    const previewUrl = e.target.result;
                    const img = new Image();
                    img.onload = () => {
                        const fileData = {
                            id: imageId,
                            file: file,
                            previewUrl: previewUrl,
                            originalWidth: img.width,
                            originalHeight: img.height,
                            cardElement: null,
                            processedBlob: null,
                            outputFilename: null
                        };

                        if (isFirstFileOverall && imageFiles.length === 0) { 
                            const initialFormat = fileData.file.type;
                            let targetValue = null;

                            if (outputFormatSelect.querySelector(`option[value="${initialFormat}"]`)) {
                                targetValue = initialFormat;
                            } else { 
                                const simpleType = initialFormat.split('/')[1];
                                if (['gif', 'bmp', 'tiff', 'svg'].includes(simpleType)) {
                                    targetValue = 'image/png'; 
                                } else {
                                    targetValue = 'image/jpeg'; 
                                }

                                if (!outputFormatSelect.querySelector(`option[value="${targetValue}"]`)) {
                                     targetValue = 'image/png'; 
                                }
                            }

                            if (targetValue) {
                                outputFormatSelect.value = targetValue;
                                toggleQualityControl();
                                console.log(`Default format set to: ${targetValue}`);

                            }
                            isFirstFileOverall = false; 
                        }

                        imageFiles.push(fileData);
                        createPreviewCard(fileData);
                        updateConvertButtonState();
                        resolve(true); 
                    };
                    img.onerror = () => {
                        showNotification(`Error reading image dimensions: ${file.name}`, 'error');
                        reject(new Error('Image dimension error'));
                    };
                    img.src = previewUrl;
                };
                reader.onerror = () => {
                    showNotification(`Error reading file: ${file.name}`, 'error');
                    reject(new Error('File reading error'));
                };
                reader.readAsDataURL(file);
            });
        };

        const processQueue = async () => {
            let successfulUploads = 0;
            for (const file of filesToAdd) {
                 try {
                     const success = await processSingleFile(file);
                     if(success) successfulUploads++;
                 } catch (error) {
                     console.error("Error processing file:", file.name, error);

                 }
                processedCount++;
                updateGlobalProgress((processedCount / totalFiles) * 100, `Loading ${processedCount}/${totalFiles} images...`);

            }
            return successfulUploads; 
        };

        processQueue().then(successfulUploads => {
            dropZone.classList.remove('uploading');
            setTimeout(() => {
                updateGlobalProgress(null); 
                if (successfulUploads > 0) {
                    showNotification(`${successfulUploads} image(s) added. Adjust settings and convert.`, 'success');
                } else if (totalFiles > 0) {
                    showNotification(`No new images were added.`, 'info');
                }
            }, 500);
        }).catch(error => {

            console.error("Error in file processing queue:", error);
            dropZone.classList.remove('uploading');
            updateGlobalProgress(null);
            showNotification("An unexpected error occurred during file loading.", "error");
        });
    };

    const createPreviewCard = (fileData) => {
        const card = imageCardTemplate.content.cloneNode(true).firstElementChild;
        card.dataset.id = fileData.id;
        fileData.cardElement = card; 

        card.querySelector('.filename').textContent = fileData.file.name;
        card.querySelector('.thumbnail').src = fileData.previewUrl;
        card.querySelector('.format').textContent = fileData.file.type.split('/')[1]?.toUpperCase() || 'Unknown';
        card.querySelector('.size').textContent = formatBytes(fileData.file.size);
        card.querySelector('.dimensions').textContent = `${fileData.originalWidth} x ${fileData.originalHeight}`;

        showCardOutputInfo(card, null, null);

        const removeBtn = card.querySelector('.remove-btn');
        removeBtn.onclick = () => {
            const cardToRemove = document.querySelector(`.image-card[data-id="${fileData.id}"]`);
            if (cardToRemove) {
                const index = imageFiles.findIndex(f => f.id === fileData.id);
                if (index > -1) {
                    imageFiles.splice(index, 1);
                    cardToRemove.classList.add('removing');
                    cardToRemove.addEventListener('transitionend', () => cardToRemove.remove(), { once: true });
                    updateConvertButtonState(); 
                    showNotification('Image removed.', 'info');

                }
            }
        };

        imagePreviews.appendChild(card);

    };

    const processImage = async (fileData, currentFileNum, totalFiles) => {
        const { file, originalWidth, originalHeight, cardElement, id } = fileData;
        if (!cardElement) {
            throw new Error(`Card element not found for ${file.name}`);
        }

        const progressBaseText = `Processing ${currentFileNum}/${totalFiles}: `;
        const shortName = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
        updateCardProgress(cardElement, 10, `${progressBaseText}${shortName}`);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        try {
            await new Promise((resolve, reject) => {
                 img.onload = resolve;
                 img.onerror = (err) => reject(new Error(`Failed to load image preview for ${file.name}`));
                 img.src = fileData.previewUrl; 
            });
        } catch (loadError) {
            console.error(loadError);
            showNotification(loadError.message, 'error');
            updateCardProgress(cardElement, null); 
            throw loadError; 
        }

        updateCardProgress(cardElement, 30, `${progressBaseText}${shortName}`);

        let targetWidth = originalWidth;
        let targetHeight = originalHeight;
        const resizeMode = resizeModeSelect.value;

        try {
            if (resizeMode === 'pixels') {
                const w = parseInt(resizeWidthInput.value);
                const h = parseInt(resizeHeightInput.value);
                if (w && !h && w > 0) {
                    targetWidth = w;
                    targetHeight = Math.round((w / originalWidth) * originalHeight);
                } else if (!w && h && h > 0) {
                    targetHeight = h;
                    targetWidth = Math.round((h / originalHeight) * originalWidth);
                } else if (w && h && w > 0 && h > 0) {
                    targetWidth = w;
                    targetHeight = h;
                } else if (w || h) { 
                    console.warn(`Invalid pixel dimensions for ${file.name}. Keeping original.`);
                }
            } else if (resizeMode === 'percentage') {
                const percent = parseInt(resizeWidthInput.value);
                if (percent && percent > 0) {
                    targetWidth = Math.round(originalWidth * (percent / 100));
                    targetHeight = Math.round(originalHeight * (percent / 100));
                } else if (percent) {
                     console.warn(`Invalid percentage for ${file.name}. Keeping original.`);
                }
            }
        } catch (e) {
             console.error(`Error calculating dimensions for ${file.name}:`, e);
             showNotification(`Error in resize settings for ${file.name}. Keeping original size.`, 'error');
             targetWidth = originalWidth;
             targetHeight = originalHeight;
        }

        targetWidth = Math.max(1, Math.round(targetWidth) || originalWidth);
        targetHeight = Math.max(1, Math.round(targetHeight) || originalHeight);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.imageSmoothingQuality = 'high'; 
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        updateCardProgress(cardElement, 60, `${progressBaseText}${shortName}`);

        const outputFormat = outputFormatSelect.value;
        let quality = parseFloat(qualitySlider.value);
        const targetSize = getTargetSizeInBytes();
        let outputBlob = null;
        const baseFilename = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        const safeBaseFilename = baseFilename.replace(/[^a-z0-9_.-]/gi, '_');
        const outputExtension = outputFormat.split('/')[1] || 'png';
        let finalFilename = `${safeBaseFilename}_minted.${outputExtension}`;

        try {
            if (targetSize && (outputFormat === 'image/jpeg' || outputFormat === 'image/webp')) {

                 let minQuality = 0.01;
                 let maxQuality = 1.0;
                 let currentQuality = quality; 
                 let bestBlob = null;
                 let lastGoodBlob = null; 

                 updateCardProgress(cardElement, 65, `Optimizing ${currentFileNum}/${totalFiles}...`);

                 for (let i = 0; i < 8; i++) { 
                     currentQuality = Math.max(minQuality, Math.min(maxQuality, currentQuality));
                     const blob = await new Promise(resolve => canvas.toBlob(resolve, outputFormat, currentQuality));

                     if (!blob) {
                         console.warn(`toBlob failed at quality ${currentQuality} for ${file.name}`);
                         maxQuality = currentQuality - 0.01; 
                         if (i === 0 && !lastGoodBlob) { 
                             throw new Error(`Initial conversion failed at quality ${currentQuality}`);
                         }
                     } else {
                         lastGoodBlob = blob; 
                         if (blob.size <= targetSize) {
                             bestBlob = blob; 
                             if (currentQuality >= 0.99) break; 
                             minQuality = currentQuality; 
                         } else {
                             maxQuality = currentQuality; 
                         }
                     }

                     if (maxQuality - minQuality < 0.02) break; 

                     currentQuality = bestBlob ? (currentQuality + maxQuality) / 2 : (minQuality + maxQuality) / 2;
                     updateCardProgress(cardElement, 65 + (i * 3), `Optimizing ${currentFileNum}/${totalFiles}...`); 
                 }

                 if (bestBlob) {
                      outputBlob = bestBlob;
                      console.log(`Target size met for ${file.name} at quality ~${minQuality.toFixed(2)}`);
                 } else if (lastGoodBlob && lastGoodBlob.size > targetSize) {

                      outputBlob = lastGoodBlob;
                      showNotification(`Could not meet target size for ${file.name}. Using smallest achieved size.`, 'info', 3000);
                 } else {

                      console.error(`Failed to generate any blob for ${file.name}`);
                      outputBlob = await new Promise(resolve => canvas.toBlob(resolve, outputFormat, 0.1)); 
                      if (!outputBlob) throw new Error("Completely failed to create blob.");
                      showNotification(`Failed to generate image for ${file.name}. Using lowest quality.`, 'error');
                 }

            } else {

                 quality = (outputFormat === 'image/jpeg' || outputFormat === 'image/webp') ? quality : undefined; 
                 outputBlob = await new Promise(resolve => canvas.toBlob(resolve, outputFormat, quality));
                 if (!outputBlob) throw new Error(`Conversion failed for ${file.name}`);
            }

             updateCardProgress(cardElement, 95, `Finalizing ${currentFileNum}/${totalFiles}...`);

             fileData.processedBlob = outputBlob;
             fileData.outputFilename = finalFilename;

             showCardOutputInfo(cardElement, outputBlob, finalFilename);
             updateCardProgress(cardElement, 100); 

             return fileData; 

        } catch (conversionError) {
             console.error(`Conversion error for ${file.name}:`, conversionError);
             showNotification(`Error during conversion of ${file.name}: ${conversionError.message}`, 'error');
             updateCardProgress(cardElement, null); 
             throw conversionError; 
        }
    };

    const triggerDownload = (blob, filename) => {
        if (!blob || !filename) return;
        try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none'; 
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (e) {
            console.error("Download error:", e);
            showNotification(`Failed to trigger download for ${filename}.`, 'error');
        }
    };

    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        e.dataTransfer.dropEffect = 'copy'; 
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.relatedTarget && !dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over');
        } else if (!e.relatedTarget) { 
             dropZone.classList.remove('drag-over');
        }
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length) {

            handleFiles(files);
        }
    });

    browseButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFiles(e.target.files);

             e.target.value = null;
        }
    });

    outputFormatSelect.addEventListener('change', () => {
        toggleQualityControl();
        saveSettings();
    });
    qualitySlider.addEventListener('input', updateQualityDisplay);
    qualitySlider.addEventListener('change', saveSettings); 
    resizeModeSelect.addEventListener('change', () => {
        toggleResizeInputs();
        saveSettings();
    });

    [resizeWidthInput, resizeHeightInput, targetSizeInput].forEach(input => {
        input.addEventListener('input', saveSettings);
    });
    targetSizeUnitSelect.addEventListener('change', saveSettings);

    convertAllButton.addEventListener('click', async () => {
        if (imageFiles.length === 0 || convertAllButton.disabled) return;

        convertAllButton.disabled = true;
        convertAllButton.innerHTML = `<svg class="icon spin" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg> Processing...`;
        saveSettings(); 

        let processedCount = 0;
        const totalToProcess = imageFiles.length;
        const successfullyProcessed = []; 

        updateGlobalProgress(0, `Starting conversion 0/${totalToProcess}...`);

        for (const [index, fileData] of imageFiles.entries()) {

            showCardOutputInfo(fileData.cardElement, null, null);
             updateCardProgress(fileData.cardElement, 5); 

            try {
                const result = await processImage(fileData, index + 1, totalToProcess);
                successfullyProcessed.push(result); 
            } catch (error) {

                console.error(`Failed to process ${fileData.file.name}:`, error);

                 if(fileData.cardElement) updateCardProgress(fileData.cardElement, null);
            }
            processedCount++;
            updateGlobalProgress((processedCount / totalToProcess) * 100, `Converted ${processedCount}/${totalToProcess}...`);

        }

        const successCount = successfullyProcessed.length;
        updateGlobalProgress(100, `Conversion complete (${successCount}/${totalToProcess} successful)`);
        showNotification(`Batch finished. ${successCount} image(s) processed successfully.`, successCount === totalToProcess ? 'success' : 'info');
        setTimeout(() => updateGlobalProgress(null), 2500);

        if (successCount > 0) {
             showNotification(`Starting download for ${successCount} file(s)...`, 'info', 2000);
             successfullyProcessed.forEach((data, index) => {

                 setTimeout(() => {
                     if (data.processedBlob && data.outputFilename) {
                         triggerDownload(data.processedBlob, data.outputFilename);
                     }
                 }, index * 300); 
             });
        }

        convertAllButton.disabled = false; 

        convertAllButton.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg> Convert & Download All`;
    });

    loadSettings(); 
    updateConvertButtonState(); 

    const style = document.createElement('style');
    style.textContent = `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .removing { transition: opacity 0.3s ease, transform 0.3s ease !important; opacity: 0; transform: scale(0.9); }
    `;
    document.head.appendChild(style);

    console.log("ImageMint Initialized!");

}); 