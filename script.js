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
const toggleMotionPanel = document.getElementById('toggleMotionPanel');
const motionPanel = document.getElementById('motionPanel');
const closeMotionPanel = document.getElementById('closeMotionPanel');
const particleField = document.getElementById('particleField');
const particleCountInput = document.getElementById('particleCount');
const particleSpeedInput = document.getElementById('particleSpeed');
const particleCountValue = document.getElementById('particleCountValue');
const particleSpeedValue = document.getElementById('particleSpeedValue');

let selectedPreset = presets[0];
let dragState = null;
let selectedItem = null;
let particles = [];
let particleAnimationFrame = null;
let particleSpeed = Number(particleSpeedInput?.value || 56);

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

function createParticles(amount) {
  if (!particleField) return;
  particles = [];
  particleField.innerHTML = '<span class="motion-note">Movimento ativo</span>';
  const bounds = particleField.getBoundingClientRect();

  for (let i = 0; i < amount; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    const size = Math.random() * 8 + 4;
    const x = Math.random() * Math.max(1, bounds.width - size);
    const y = Math.random() * Math.max(1, bounds.height - size);
    const vx = (Math.random() * 2 - 1) * 0.5;
    const vy = (Math.random() * 2 - 1) * 0.5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.opacity = `${Math.random() * 0.5 + 0.4}`;
    particle.style.transform = `translate(${x}px, ${y}px)`;
    particleField.appendChild(particle);
    particles.push({ node: particle, x, y, vx, vy, size });
  }
}

function animateParticles() {
  if (!particleField) return;
  const bounds = particleField.getBoundingClientRect();
  const speedFactor = particleSpeed / 50;

  particles.forEach((particle) => {
    particle.x += particle.vx * speedFactor;
    particle.y += particle.vy * speedFactor;

    if (particle.x < 0) {
      particle.x = 0;
      particle.vx *= -1;
    }
    if (particle.x > bounds.width - particle.size) {
      particle.x = bounds.width - particle.size;
      particle.vx *= -1;
    }
    if (particle.y < 0) {
      particle.y = 0;
      particle.vy *= -1;
    }
    if (particle.y > bounds.height - particle.size) {
      particle.y = bounds.height - particle.size;
      particle.vy *= -1;
    }

    particle.node.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
  });

  particleAnimationFrame = requestAnimationFrame(animateParticles);
}

function startParticleLoop() {
  if (particleAnimationFrame) return;
  particleAnimationFrame = requestAnimationFrame(animateParticles);
}

function stopParticleLoop() {
  if (particleAnimationFrame) {
    cancelAnimationFrame(particleAnimationFrame);
    particleAnimationFrame = null;
  }
}

function updateParticleSettings() {
  if (!particleCountInput || !particleSpeedInput) return;
  particleCountValue.textContent = particleCountInput.value;
  particleSpeedValue.textContent = particleSpeedInput.value;
  particleSpeed = Number(particleSpeedInput.value);
  createParticles(Number(particleCountInput.value));
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
  updateTypography();
});

[textContent, fontFamily, fontSize, fontWeight, fontStyle, textDecoration, textColor, textAlign, letterSpacing, lineHeight, textPadding, textBackgroundEnabled, textBackgroundColor, textRadius, textShadowEnabled].forEach((control) => {
  control.addEventListener('input', updateTypography);
  control.addEventListener('change', updateTypography);
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
  }
});

bringFrontBtn.addEventListener('click', () => {
  if (!selectedItem) return;
  selectedItem.parentElement.appendChild(selectedItem);
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

if (toggleMotionPanel) {
  toggleMotionPanel.addEventListener('click', () => {
    const isOpen = motionPanel.classList.toggle('open');
    motionPanel.setAttribute('aria-hidden', String(!isOpen));
    toggleMotionPanel.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      updateParticleSettings();
      startParticleLoop();
    } else {
      stopParticleLoop();
    }
  });
}

if (closeMotionPanel) {
  closeMotionPanel.addEventListener('click', () => {
    toggleMotionPanel?.click();
  });
}

if (particleCountInput) {
  particleCountInput.addEventListener('input', updateParticleSettings);
}

if (particleSpeedInput) {
  particleSpeedInput.addEventListener('input', updateParticleSettings);
}

window.addEventListener('resize', () => {
  if (motionPanel.classList.contains('open')) {
    createParticles(Number(particleCountInput.value));
  }
});

updatePresetView();
toggleGrid();
toggleSafeArea();
updateTypography();
clearMedia();
