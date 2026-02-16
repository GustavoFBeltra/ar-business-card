import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

import { CardModel } from './scene/CardModel.js';
import { LogoModel } from './scene/LogoModel.js';
import { MenuSystem } from './scene/MenuSystem.js';
import { ParticleSystem } from './scene/ParticleSystem.js';
import { LightingRig } from './scene/LightingRig.js';

import { GestureHandler } from './interactions/GestureHandler.js';
import { Raycaster } from './interactions/Raycaster.js';
import { MenuController } from './interactions/MenuController.js';

import { ContactActions } from './actions/ContactActions.js';
import { SocialActions } from './actions/SocialActions.js';
import { PortfolioActions } from './actions/PortfolioActions.js';

import { TransitionManager } from './animations/TransitionManager.js';

import { LoadingScreen } from './ui/LoadingScreen.js';
import { PermissionPrompt } from './ui/PermissionPrompt.js';
import { InstructionOverlay } from './ui/InstructionOverlay.js';

import { AR } from './utils/Constants.js';

// ─── App State ──────────────────────────────────────────────────────
let mindarThree = null;
let clock = null;
let isRunning = false;

// Modules
let cardModel, logoModel, menuSystem, particleSystem, lightingRig;
let gestureHandler, raycaster, menuController;
let transitionManager;
let portfolioActions;
let loadingScreen, permissionPrompt, instructionOverlay;

// ─── Initialize ─────────────────────────────────────────────────────
async function init() {
  loadingScreen = new LoadingScreen();
  permissionPrompt = new PermissionPrompt();
  instructionOverlay = new InstructionOverlay();

  loadingScreen.setText('Requesting camera...');
  loadingScreen.setProgress(10);

  // Step 1: Camera permission
  const hasCamera = await permissionPrompt.request();
  if (!hasCamera) {
    loadingScreen.setText('Camera access denied. Please refresh and allow camera.');
    return;
  }
  permissionPrompt.hide();

  loadingScreen.setText('Starting AR engine...');
  loadingScreen.setProgress(30);

  // Step 2: Create MindAR instance
  const container = document.getElementById('ar-container');

  mindarThree = new MindARThree({
    container,
    imageTargetSrc: AR.targetFile,
    maxTrack: 1,
    uiLoading: 'no',
    uiScanning: 'no',
    uiError: 'no',
    filterMinCF: AR.filterMinCF,
    filterBeta: AR.filterBeta,
    warmupTolerance: AR.warmupTolerance,
    missTolerance: AR.missTolerance,
  });

  const { renderer, scene, camera } = mindarThree;

  // Renderer settings
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  loadingScreen.setText('Building scene...');
  loadingScreen.setProgress(50);

  // Step 3: Build scene
  clock = new THREE.Clock();

  // Lighting
  lightingRig = new LightingRig(scene);

  // Create anchor for image target 0
  const anchor = mindarThree.addAnchor(0);

  // Card pivot group (all AR content parents to this)
  const cardPivot = new THREE.Group();
  cardPivot.name = 'card-pivot';
  anchor.group.add(cardPivot);

  // Card model
  cardModel = new CardModel();
  cardPivot.add(cardModel.getObject());

  // Logo
  logoModel = new LogoModel();
  await logoModel.load();
  cardPivot.add(logoModel.getObject());

  loadingScreen.setProgress(70);

  // Menu system (child of cardPivot → auto-inherits AR tracking)
  menuSystem = new MenuSystem();
  cardPivot.add(menuSystem.getObject());

  // Particle system
  particleSystem = new ParticleSystem();
  cardPivot.add(particleSystem.getObject());

  // Portfolio
  portfolioActions = new PortfolioActions();
  portfolioActions.build();
  cardPivot.add(portfolioActions.getObject());

  loadingScreen.setText('Setting up interactions...');
  loadingScreen.setProgress(85);

  // Step 4: Interactions
  menuController = new MenuController();
  gestureHandler = new GestureHandler(container);
  raycaster = new Raycaster(camera);

  // Animation orchestrator
  transitionManager = new TransitionManager(
    cardModel,
    logoModel,
    menuSystem,
    menuController
  );

  // Wire AR events
  anchor.onTargetFound = () => {
    instructionOverlay.hide();
    transitionManager.onTargetFound();
  };

  anchor.onTargetLost = () => {
    instructionOverlay.show();
    transitionManager.onTargetLost();
  };

  // Wire gesture events
  gestureHandler.on('tap', (data) => {
    if (!menuController.isInteractive()) return;

    const ndc = gestureHandler.getNDC(data.x, data.y);
    const allHitboxes = [
      ...menuSystem.getHitboxes(),
      ...portfolioActions.getHitTargets(),
    ];
    const hit = raycaster.cast(ndc.x, ndc.y, allHitboxes);

    if (hit) {
      if (hit.action) {
        // Menu item tap
        transitionManager.onMenuItemTap(hit.id);
        menuController.selectItem(hit.id, hit.action);
        executeAction(hit.action);
        particleSystem.burstToward(hit.point);
      } else if (hit.portfolioCard) {
        // Portfolio card tap
        portfolioActions.openProject(hit.index);
        particleSystem.burstToward(hit.point);
      }
    }
  });

  gestureHandler.on('swipe', (data) => {
    // Swipe to rotate the card pivot slightly
    if (!menuController.isVisible()) return;
    const rotateAmount = data.dx * 0.003;
    cardPivot.rotation.y += rotateAmount;
  });

  gestureHandler.on('longpress', () => {
    // Long-press to flip card
    if (!menuController.isVisible()) return;
    transitionManager.flipCard();
  });

  // Wire menu controller events
  menuController.on('itemHover', (data) => {
    menuSystem.setHovered(data.id);
    transitionManager.onMenuItemHover(data.id);
  });

  loadingScreen.setProgress(95);

  // Step 5: Start AR
  try {
    loadingScreen.setText('Starting camera...');
    await mindarThree.start();
    isRunning = true;

    loadingScreen.setProgress(100);
    loadingScreen.setText('Ready!');

    setTimeout(() => {
      loadingScreen.hide();
      instructionOverlay.show();
    }, 400);

    // Render loop
    renderer.setAnimationLoop(() => {
      const elapsed = clock.getElapsedTime();

      // Update animated elements
      logoModel.update(elapsed);
      particleSystem.update(elapsed);

      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error('MindAR start failed:', err);
    loadingScreen.setText('AR initialization failed. Please refresh.');
  }
}

// ─── Action Dispatcher ──────────────────────────────────────────────
function executeAction(action) {
  switch (action) {
    // Contact
    case 'call':
      ContactActions.call();
      break;
    case 'email':
      ContactActions.email();
      break;
    case 'vcard':
      ContactActions.vcard();
      break;
    case 'website':
      ContactActions.website();
      break;

    // Social
    case 'linkedin':
      SocialActions.linkedin();
      break;
    case 'instagram':
      SocialActions.instagram();
      break;
    case 'x':
      SocialActions.x();
      break;
    case 'github':
      SocialActions.github();
      break;
    case 'youtube':
      SocialActions.youtube();
      break;
    case 'tiktok':
      SocialActions.tiktok();
      break;

    // Portfolio
    case 'portfolio':
      portfolioActions.toggle();
      break;

    default:
      console.warn('Unknown action:', action);
  }
}

// ─── Start ──────────────────────────────────────────────────────────
init().catch((err) => {
  console.error('Init failed:', err);
});
