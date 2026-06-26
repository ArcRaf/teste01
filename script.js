const presets = [
  {
    label: 'Post de feed',
    width: 1080,
    height: 1350,
    ratio: '4 / 5',
    description: 'Ideal para fotos e carrosséis com foco em narrativa visual.'
  },
  {
    label: 'Story',
    width: 1080,
    height: 1920,
    ratio: '9 / 16',
    description: 'Formato vertical para stories com espaço de leitura e call-to-action.'
  },
  {
    label: 'Reel',
    width: 1080,
    height: 1920,
    ratio: '9 / 16',
    description: 'Layout vertical para vídeos curtos e conteúdo em movimento.'
  },
  {
    label: 'Perfil',
    width: 1080,
    height: 1080,
    ratio: '1 / 1',
    description: 'Padrão quadrado para foto de perfil e capas de destaque.'
  }
];

const presetList = document.getElementById('presetList');
const presetsWrap = document.getElementById('presets');
const canvas = document.getElementById('canvas');
const canvasSize = document.getElementById('canvasSize');
const canvasRatio = document.getElementById('canvasRatio');
const currentPresetTitle = document.getElementById('currentPresetTitle');
const currentPresetMeta = document.getElementById('currentPresetMeta');
const mediaInput = document.getElementById('mediaInput');
const mediaLayer = document.getElementById('mediaLayer');
const mediaInfo = document.getElementById('mediaInfo');
const showGrid = document.getElementById('showGrid');
const showSafeArea = document.getElementById('showSafeArea');
const resetPreview = document.getElementById('resetPreview');
const textLayer = document.getElementById('textLayer');
const textContent = document.getElementById('textContent');
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontWeight = document.getElementById('fontWeight');
const fontStyle = document.getElementById('fontStyle');
const textDecoration = document.getElementById('textDecoration');
const textColor = document.getElementById('textColor');
const textAlign = document.getElementById('textAlign');
const letterSpacing = document.getElementById('letterSpacing');
const letterSpacingValue = document.getElementById('letterSpacingValue');
const lineHeight = document.getElementById('lineHeight');
const lineHeightValue = document.getElementById('lineHeightValue');
const textPadding = document.getElementById('textPadding');
const textPaddingValue = document.getElementById('textPaddingValue');
const textBackgroundEnabled = document.getElementById('textBackgroundEnabled');
const textBackgroundColor = document.getElementById('textBackgroundColor');
const textRadius = document.getElementById('textRadius');
const textRadiusValue = document.getElementById('textRadiusValue');
const textShadowEnabled = document.getElementById('textShadowEnabled');
const selectionToolbar = document.getElementById('selectionToolbar');
const bringFrontBtn = document.getElementById('bringFrontBtn');
const sendBackBtn = document.getElementById('sendBackBtn');
const itemScale = document.getElementById('itemScale');
const textControls = document.getElementById('textControls');
const overlayTextInput = document.getElementById('overlayTextInput');
const overlayTextColor = document.getElementById('overlayTextColor');
const downloadPreview = document.getElementById('downloadPreview');
const scaleControl = document.getElementById('scaleControl');
const scaleValue = document.getElementById('scaleValue');
const motionCanvas = document.getElementById('motionCanvas');
const motionSlider = document.getElementById('motionSlider');
const motionJoystick = document.getElementById('motionJoystick');
const motionSpeedInput = document.getElementById('motionSpeed');
const motionSpeedValue = document.getElementById('motionSpeedValue');
const motionDirectionValue = document.getElementById('motionDirectionValue');
const exportVideo = document.getElementById('exportVideo');
const resetMotion = document.getElementById('resetMotion');

let selectedPreset = presets[0];
let dragState = null;
let selectedItem = null;
let motionContext = null;
let motionFrame = 0;
let motionObjects = [];
let motionDirection = 0;
let motionSpeed = Number(motionSpeedInput?.value || 1.4);
let motionRecording = false;
let motionRecorder = null;
let recordedChunks = [];

function isAcceptedFile(file) {
  return Boolean(file && (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg')));
}

function renderPresets() {
  presetList.innerHTML = presets
    .map((preset) => `<li>${preset.label}: ${preset.width} × ${preset.height} px</li>`)
    .join('');

  presetsWrap.innerHTML = presets
    .map((preset) => `
      <button class="preset-btn ${preset.label === selectedPreset.label ? 'active' : ''}" type="button" data-label="${preset.label}">
        <strong>${preset.label}</strong>
        <span>${preset.width} × ${preset.height} px · ${preset.ratio}</span>
      </button>
    `)
    .join('');
}

function updatePresetView() {
  canvas.style.setProperty('--canvas-ratio', selectedPreset.ratio);
  canvasSize.textContent = `${selectedPreset.width} × ${selectedPreset.height} px`;
  canvasRatio.textContent = selectedPreset.ratio.replace(' / ', ':');
  currentPresetTitle.textContent = selectedPreset.label;
  currentPresetMeta.textContent = selectedPreset.description;
  renderPresets();
}

function toggleGrid() {
  canvas.classList.toggle('grid-active', showGrid.checked);
}

function toggleSafeArea() {
  canvas.classList.toggle('safe-area-hidden', !showSafeArea.checked);
}

function clearMedia() {
  mediaLayer.innerHTML = '';
  mediaInfo.textContent = 'Nenhuma mídia adicionada ainda. Envie uma imagem ou SVG para começar.';
}

function updateMediaInfo() {
  const count = mediaLayer.querySelectorAll('img').length;
  mediaInfo.textContent = count > 0
    ? `${count} mídia(s) adicionada(s). Arraste cada item para ajustar a composição.`
    : 'Nenhuma mídia adicionada ainda. Envie uma imagem ou SVG para começar.';
}

function updateTypography() {
  if (!selectedItem || selectedItem === textLayer) {
    textLayer.textContent = textContent.value || 'Seu texto';
  }
  textLayer.style.fontFamily = fontFamily.value;
  textLayer.style.fontSize = `${fontSize.value}px`;
  textLayer.style.fontWeight = fontWeight.value;
  textLayer.style.fontStyle = fontStyle.value;
  textLayer.style.textDecoration = textDecoration.value;
  textLayer.style.color = textColor.value;
  textLayer.style.textAlign = textAlign.value;
  textLayer.style.letterSpacing = `${letterSpacing.value}px`;
  textLayer.style.lineHeight = lineHeight.value;
  textLayer.style.padding = `${textPadding.value}px`;
  textLayer.style.borderRadius = `${textRadius.value}px`;
  textLayer.style.background = textBackgroundEnabled.checked ? textBackgroundColor.value : 'transparent';
  textLayer.style.boxShadow = textShadowEnabled.checked ? '0 10px 22px rgba(0, 0, 0, 0.24)' : 'none';
  fontSizeValue.textContent = `${fontSize.value}px`;
  letterSpacingValue.textContent = `${letterSpacing.value}px`;
  lineHeightValue.textContent = lineHeight.value;
  textPaddingValue.textContent = `${textPadding.value}px`;
  textRadiusValue.textContent = `${textRadius.value}px`;
}

function updateScaleThumb(value) {
  if (!scaleControl) return;
  const track = scaleControl.querySelector('.arrow-track');
  const thumb = scaleControl.querySelector('.arrow-thumb');
  if (!track || !thumb) return;

  const min = 30;
  const max = 180;
  const ratio = (value - min) / (max - min);
  const trackWidth = track.getBoundingClientRect().width;
  thumb.style.left = `${Math.max(0, Math.min(trackWidth, ratio * trackWidth))}px`;
}

function setScaleValue(value, applyToSelected = true) {
  const normalized = Math.max(30, Math.min(180, Number(value)));

  if (scaleControl) {
    scaleControl.setAttribute('aria-valuenow', String(Math.round(normalized)));
    scaleControl.setAttribute('aria-valuetext', `${Math.round(normalized)}%`);
  }

  if (scaleValue) {
    scaleValue.textContent = `${Math.round(normalized)}%`;
  }

  updateScaleThumb(normalized);

  if (applyToSelected && selectedItem) {
    selectedItem.style.setProperty('--scale', String(normalized / 100));
    if (itemScale) {
      itemScale.value = String(Math.round(normalized));
    }
  }
}

function syncScaleControlWithSelection() {
  let currentScale = 100;
  if (selectedItem) {
    currentScale = Number(selectedItem.style.getPropertyValue('--scale')) * 100;
    if (Number.isNaN(currentScale) || currentScale <= 0) {
      currentScale = 100;
    }
  }

  setScaleValue(currentScale, false);
  if (itemScale) {
    itemScale.value = String(Math.round(currentScale));
  }
}

function handleScalePointer(event) {
  if (!scaleControl) return;
  const track = scaleControl.querySelector('.arrow-track');
  if (!track) return;

  const bounds = track.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - bounds.left, bounds.width));
  const percent = 30 + (x / bounds.width) * 150;
  setScaleValue(percent, true);
}

function initMotionCanvas() {
  if (!motionCanvas) return;
  motionContext = motionCanvas.getContext('2d');
  motionCanvas.width = 960;
  motionCanvas.height = 540;
  motionDirection = 0;
  motionSpeed = Number(motionSpeedInput?.value || 1.4);
  motionObjects = Array.from({ length: 5 }, (_, index) => ({
    x: 80 + index * 140,
    y: 120 + (index % 3) * 100,
    radius: 28 + (index % 3) * 6,
    color: `hsla(${180 + index * 24}, 90%, 70%, 0.95)`,
    vx: 0.8 + index * 0.1,
    vy: 0.6 + (index % 2) * 0.2,
    phase: index * 0.4,
  }));
  motionFrame = 0;
}

function drawMotionFrame() {
  if (!motionContext) return;
  const { width, height } = motionCanvas;
  motionContext.clearRect(0, 0, width, height);

  const gradient = motionContext.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0d1728');
  gradient.addColorStop(0.5, '#102b4d');
  gradient.addColorStop(1, '#081020');
  motionContext.fillStyle = gradient;
  motionContext.fillRect(0, 0, width, height);

  motionObjects.forEach((item) => {
    item.x += item.vx * motionSpeed * (motionDirection || 0.8);
    item.y += Math.sin(motionFrame * 0.015 + item.phase) * 0.8;
    if (item.x > width + item.radius) item.x = -item.radius;
    if (item.x < -item.radius) item.x = width + item.radius;
    const glow = motionContext.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.radius * 2.2);
    glow.addColorStop(0, item.color);
    glow.addColorStop(0.5, 'rgba(255,255,255,0.04)');
    glow.addColorStop(1, 'transparent');
    motionContext.fillStyle = glow;
    motionContext.fillRect(item.x - item.radius * 2.2, item.y - item.radius * 2.2, item.radius * 4.4, item.radius * 4.4);

    motionContext.beginPath();
    motionContext.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    motionContext.fillStyle = item.color;
    motionContext.fill();
    motionContext.strokeStyle = 'rgba(255,255,255,0.24)';
    motionContext.lineWidth = 2;
    motionContext.stroke();
  });

  motionContext.font = '700 24px Inter, sans-serif';
  motionContext.fillStyle = 'rgba(255,255,255,0.88)';
  motionContext.fillText('Motion Studio', 28, 42);
  motionContext.font = '500 14px Inter, sans-serif';
  motionContext.fillStyle = 'rgba(255,255,255,0.65)';
  motionContext.fillText('Arraste a barra < > para ajustar direção e intensidade', 28, 66);
  motionFrame += 1;
}

function animateMotion() {
  drawMotionFrame();
  requestAnimationFrame(animateMotion);
}

function updateMotionSlider(value) {
  if (!motionSlider) return;
  const bounds = motionSlider.getBoundingClientRect();
  const handle = motionSlider.querySelector('.motion-slider-handle');
  const center = bounds.width / 2;
  const position = center + (value * (bounds.width / 2 - 16));
  if (handle) {
    handle.style.left = `${position}px`;
  }
  motionDirection = value;
  if (motionDirectionValue) {
    motionDirectionValue.textContent = `${Math.round(value * 100)}%`;
  }
  if (motionSlider) {
    motionSlider.setAttribute('aria-valuenow', String(Math.round(value * 100)));
  }
  if (motionJoystick) {
    const joystickHandle = motionJoystick.querySelector('.motion-joystick-handle');
    if (joystickHandle) {
      joystickHandle.style.left = `${50 + value * 40}%`;
    }
  }
}

function pointerDragDirection(event) {
  if (!motionSlider) return;
  const bounds = motionSlider.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - bounds.left, bounds.width));
  const normalized = (x / bounds.width) * 2 - 1;
  updateMotionSlider(normalized);
}

function pointerDragJoystick(event) {
  if (!motionJoystick) return;
  const ring = motionJoystick.querySelector('.motion-joystick-ring');
  if (!ring) return;
  const bounds = ring.getBoundingClientRect();
  const x = Math.max(bounds.left, Math.min(event.clientX, bounds.right));
  const normalized = ((x - bounds.left) / bounds.width) * 2 - 1;
  updateMotionSlider(normalized);
}

function initMotionControls() {
  if (motionSpeedInput && motionSpeedValue) {
    motionSpeedValue.textContent = `${motionSpeedInput.value}x`;
    motionSpeedInput.addEventListener('input', () => {
      motionSpeed = Number(motionSpeedInput.value);
      motionSpeedValue.textContent = `${motionSpeed.toFixed(1)}x`;
    });
  }

  if (motionSlider) {
    let dragging = false;
    motionSlider.addEventListener('pointerdown', (event) => {
      dragging = true;
      motionSlider.setPointerCapture(event.pointerId);
      pointerDragDirection(event);
    });
    motionSlider.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      pointerDragDirection(event);
    });
    motionSlider.addEventListener('pointerup', () => { dragging = false; });
    motionSlider.addEventListener('pointercancel', () => { dragging = false; });
  }

  if (motionJoystick) {
    let joystickDragging = false;
    motionJoystick.addEventListener('pointerdown', (event) => {
      joystickDragging = true;
      motionJoystick.setPointerCapture(event.pointerId);
      pointerDragJoystick(event);
    });
    motionJoystick.addEventListener('pointermove', (event) => {
      if (!joystickDragging) return;
      pointerDragJoystick(event);
    });
    motionJoystick.addEventListener('pointerup', () => { joystickDragging = false; });
    motionJoystick.addEventListener('pointercancel', () => { joystickDragging = false; });
  }

  if (exportVideo) {
    exportVideo.addEventListener('click', async () => {
      if (!motionCanvas || motionRecording) return;
      if (typeof MediaRecorder === 'undefined') {
        alert('Seu navegador não suporta exportação de vídeo.');
        return;
      }
      const stream = motionCanvas.captureStream(30);
      const options = { mimeType: 'video/webm;codecs=vp8' };
      recordedChunks = [];
      try {
        motionRecorder = new MediaRecorder(stream, options);
      } catch (err) {
        alert('Não foi possível iniciar a gravação de vídeo.');
        return;
      }
      motionRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      };
      motionRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'motion-export.webm';
        link.click();
        URL.revokeObjectURL(url);
        motionRecording = false;
        exportVideo.textContent = 'Salvar como vídeo';
      };
      motionRecording = true;
      exportVideo.textContent = 'Gravando...';
      motionRecorder.start();
      setTimeout(() => {
        motionRecorder.stop();
      }, 2200);
    });
  }

  if (resetMotion) {
    resetMotion.addEventListener('click', () => {
      motionSpeed = Number(motionSpeedInput?.value || 1.4);
      updateMotionSlider(0);
      if (motionSpeedInput) {
        motionSpeedInput.value = '1.4';
        motionSpeedValue.textContent = '1.4x';
      }
    });
  }
}

function initMotionGui() {
  if (typeof lil === 'undefined' || typeof lil.GUI !== 'function') return;
  const guiContainer = document.getElementById('guiContainer');
  if (!guiContainer) return;

  const motionSettings = {
    velocidade: motionSpeed,
    direcao: motionDirection * 100,
    reset: () => {
      motionSpeed = 1.4;
      if (motionSpeedInput) {
        motionSpeedInput.value = '1.4';
      }
      if (motionSpeedValue) {
        motionSpeedValue.textContent = '1.4x';
      }
      updateMotionSlider(0);
    },
    exportVideo: () => {
      if (exportVideo) {
        exportVideo.click();
      }
    }
  };

  const gui = new lil.GUI({ container: guiContainer, title: 'Controles' });
  gui.add(motionSettings, 'velocidade', 0.5, 3, 0.1).name('Velocidade').onChange((value) => {
    motionSpeed = value;
    if (motionSpeedInput) motionSpeedInput.value = value.toFixed(1);
    if (motionSpeedValue) motionSpeedValue.textContent = `${value.toFixed(1)}x`;
  });
  gui.add(motionSettings, 'direcao', -100, 100, 1).name('Direção').onChange((value) => {
    updateMotionSlider(value / 100);
  });
  gui.add(motionSettings, 'reset').name('Resetar motion');
  gui.add(motionSettings, 'exportVideo').name('Salvar vídeo');
}

function selectItem(target) {
  selectedItem = target;
  document.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'));
  target.classList.add('selected');
  selectionToolbar.classList.add('active');
  const isText = target === textLayer;
  textControls.classList.toggle('hidden', !isText);
  if (isText) {
    overlayTextInput.value = textLayer.textContent;
    overlayTextColor.value = textLayer.style.color || '#ffffff';
  }
  itemScale.value = String(Math.round((parseFloat(target.style.getPropertyValue('--scale')) || 1) * 100));
  syncScaleControlWithSelection();
}

function startDragging(event) {
  const target = event.currentTarget;
  selectItem(target);

  dragState = {
    target,
    startX: event.clientX,
    startY: event.clientY,
    startOffsetX: parseFloat(target.style.getPropertyValue('--offset-x')) || 0,
    startOffsetY: parseFloat(target.style.getPropertyValue('--offset-y')) || 0,
  };

  target.classList.add('dragging');
  target.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function onPointerMove(event) {
  if (!dragState) return;

  const deltaX = event.clientX - dragState.startX;
  const deltaY = event.clientY - dragState.startY;
  const nextX = dragState.startOffsetX + deltaX;
  const nextY = dragState.startOffsetY + deltaY;

  dragState.target.style.setProperty('--offset-x', `${nextX}px`);
  dragState.target.style.setProperty('--offset-y', `${nextY}px`);
}

function stopDragging() {
  if (dragState?.target) {
    dragState.target.classList.remove('dragging');
  }
  dragState = null;
}

function handleFile(file) {
  if (!isAcceptedFile(file)) {
    return;
  }

  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const reader = new FileReader();

  reader.onload = (event) => {
    const dataUrl = event.target.result;
    const image = document.createElement('img');
    image.src = dataUrl;
    image.alt = file.name;
    image.draggable = false;
    image.style.setProperty('--offset-x', '0px');
    image.style.setProperty('--offset-y', '0px');
    image.style.setProperty('--scale', '1');
    image.style.width = 'auto';
    image.style.height = 'auto';
    image.style.maxWidth = '86%';
    image.style.maxHeight = '86%';
    image.classList.toggle('svg-item', isSvg);
    image.addEventListener('pointerdown', startDragging);
    mediaLayer.appendChild(image);
    updateMediaInfo();
    mediaInfo.textContent = `${mediaInfo.textContent}\n${file.name} · ${Math.round(file.size / 1024)} KB · ${isSvg ? 'SVG' : 'imagem'}`;
  };

  reader.readAsDataURL(file);
}

presetsWrap.addEventListener('click', (event) => {
  const button = event.target.closest('.preset-btn');
  if (!button) return;

  selectedPreset = presets.find((preset) => preset.label === button.dataset.label) || presets[0];
  updatePresetView();
});

mediaInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files || []).filter(isAcceptedFile);
  files.forEach(handleFile);
  event.target.value = '';
});

function handleDragEnter(event) {
  event.preventDefault();
  event.stopPropagation();
  document.body.classList.add('drag-over');
}

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
  document.body.classList.add('drag-over');
}

function handleDragLeave(event) {
  if (event.target === document.body || event.target === document.documentElement) {
    document.body.classList.remove('drag-over');
  }
}

function handleDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  document.body.classList.remove('drag-over');

  const files = Array.from(event.dataTransfer?.files || []).filter(isAcceptedFile);
  files.forEach(handleFile);
}

window.addEventListener('dragenter', handleDragEnter);
window.addEventListener('dragover', handleDragOver);
window.addEventListener('dragleave', handleDragLeave);
window.addEventListener('drop', handleDrop);

showGrid.addEventListener('change', toggleGrid);
showSafeArea.addEventListener('change', toggleSafeArea);
resetPreview.addEventListener('click', () => {
  mediaInput.value = '';
  clearMedia();
  textContent.value = 'Seu texto';
  fontFamily.value = 'Inter, Segoe UI, sans-serif';
  fontSize.value = '36';
  fontWeight.value = '400';
  fontStyle.value = 'normal';
  textDecoration.value = 'none';
  textColor.value = '#ffffff';
  textAlign.value = 'center';
  letterSpacing.value = '0';
  lineHeight.value = '1.15';
  textPadding.value = '10';
  textBackgroundEnabled.checked = false;
  textBackgroundColor.value = '#111827';
  textRadius.value = '12';
  textShadowEnabled.checked = true;
  textLayer.style.setProperty('--offset-x', '0px');
  textLayer.style.setProperty('--offset-y', '0px');
  itemScale.value = '100';
  setScaleValue(100);
});

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', stopDragging);
window.addEventListener('pointercancel', stopDragging);
textLayer.addEventListener('pointerdown', startDragging);
canvas.addEventListener('click', (event) => {
  if (event.target === canvas) {
    selectedItem = null;
    document.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'));
    selectionToolbar.classList.remove('active');
    syncScaleControlWithSelection();
  }
});

sendBackBtn.addEventListener('click', () => {
  if (!selectedItem) return;
  const parent = selectedItem.parentElement;
  const firstChild = parent.firstElementChild;
  if (firstChild && firstChild !== selectedItem) {
    parent.insertBefore(selectedItem, firstChild);
  }
});

itemScale.addEventListener('input', () => {
  if (!selectedItem) return;
  const value = Number(itemScale.value) / 100;
  selectedItem.style.setProperty('--scale', value);
  setScaleValue(Number(itemScale.value), false);
});

overlayTextInput.addEventListener('input', () => {
  if (selectedItem === textLayer) {
    textContent.value = overlayTextInput.value;
    updateTypography();
  }
});

overlayTextColor.addEventListener('input', () => {
  if (selectedItem === textLayer) {
    textColor.value = overlayTextColor.value;
    updateTypography();
  }
});

downloadPreview.addEventListener('click', async () => {
  if (typeof window.html2canvas !== 'function') {
    alert('Não foi possível carregar a exportação no momento.');
    return;
  }

  const originalLabel = downloadPreview.textContent;
  downloadPreview.disabled = true;
  downloadPreview.textContent = 'Gerando...';

  const wasActive = selectionToolbar.classList.contains('active');
  selectionToolbar.classList.remove('active');

  try {
    const canvasImage = await window.html2canvas(canvas, {
      backgroundColor: '#101426',
      scale: 2,
      useCORS: true,
      logging: false
    });

    const link = document.createElement('a');
    link.download = 'instagram-layout.png';
    link.href = canvasImage.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error(error);
    alert('Não foi possível gerar a imagem.');
  } finally {
    if (wasActive) {
      selectionToolbar.classList.add('active');
    }
    downloadPreview.disabled = false;
    downloadPreview.textContent = originalLabel;
  }
});

if (motionCanvas) {
  initMotionCanvas();
  updateMotionSlider(0);
  initMotionControls();
  initMotionGui();
  animateMotion();
}

if (scaleControl) {
  let scaleDragging = false;
  setScaleValue(100);

  scaleControl.addEventListener('pointerdown', (event) => {
    scaleDragging = true;
    scaleControl.setPointerCapture(event.pointerId);
    handleScalePointer(event);
  });

  scaleControl.addEventListener('pointermove', (event) => {
    if (!scaleDragging) return;
    handleScalePointer(event);
  });

  scaleControl.addEventListener('pointerup', () => {
    scaleDragging = false;
  });

  scaleControl.addEventListener('pointercancel', () => {
    scaleDragging = false;
  });

  scaleControl.addEventListener('keydown', (event) => {
    const current = Number(scaleControl.getAttribute('aria-valuenow')) || 100;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setScaleValue(Math.max(30, current - 5), true);
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setScaleValue(Math.min(180, current + 5), true);
    }
  });
}

updatePresetView();
toggleGrid();
toggleSafeArea();
updateTypography();
clearMedia();
