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

let selectedPreset = presets[0];
let dragState = null;

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

function updateTypography() {
  textLayer.textContent = textContent.value || 'Seu texto';
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

function startDragging(event) {
  const target = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const maxX = Math.max(0, rect.width / 2 - targetRect.width / 2);
  const maxY = Math.max(0, rect.height / 2 - targetRect.height / 2);

  dragState = {
    target,
    startX: event.clientX,
    startY: event.clientY,
    startOffsetX: parseFloat(target.style.getPropertyValue('--offset-x')) || 0,
    startOffsetY: parseFloat(target.style.getPropertyValue('--offset-y')) || 0,
    maxX,
    maxY
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

  const clampedX = Math.max(-dragState.maxX, Math.min(dragState.maxX, nextX));
  const clampedY = Math.max(-dragState.maxY, Math.min(dragState.maxY, nextY));

  dragState.target.style.setProperty('--offset-x', `${clampedX}px`);
  dragState.target.style.setProperty('--offset-y', `${clampedY}px`);
}

function stopDragging() {
  if (dragState?.target) {
    dragState.target.classList.remove('dragging');
  }
  dragState = null;
}

function handleFile(file) {
  if (!file) {
    clearMedia();
    return;
  }

  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const reader = new FileReader();

  reader.onload = (event) => {
    const dataUrl = event.target.result;
    mediaLayer.innerHTML = '';
    const image = document.createElement('img');
    image.src = dataUrl;
    image.alt = 'Mídia carregada';
    image.draggable = false;
    image.style.setProperty('--offset-x', '0px');
    image.style.setProperty('--offset-y', '0px');
    image.addEventListener('pointerdown', startDragging);
    mediaLayer.appendChild(image);
    mediaInfo.textContent = `${file.name} · ${Math.round(file.size / 1024)} KB · ${isSvg ? 'SVG' : 'imagem'}`;
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
  handleFile(event.target.files[0]);
});

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

updatePresetView();
toggleGrid();
toggleSafeArea();
updateTypography();
clearMedia();
