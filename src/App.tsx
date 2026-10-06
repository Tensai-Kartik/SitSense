import React, { useState } from 'react';
import { Sidebar, TabId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { useMonitoring } from './hooks/useMonitoring';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitor } from './pages/LiveMonitor';
import { Recommendations } from './pages/Recommendations';
import { Exercises } from './pages/Exercises';
import { Analytics } from './pages/Analytics';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { ExerciseRunnerModal } from './components/exercises/ExerciseRunnerModal';
import { CalibrationModal } from './components/calibration/CalibrationModal';
import { DemoToolbar } from './components/demo/DemoToolbar';
import { DeveloperPanel } from './components/debug/DeveloperPanel';
import { HydrationModal } from './components/notifications/HydrationModal';
import { CameraPermissionModal } from './components/onboarding/CameraPermissionModal';
import { PostureAlertToast } from './components/notifications/PostureAlertToast';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const {
    settings,
    updateSettings,
    calibration,
    updateCalibration,
    videoRef,
    canvasRef,
    isCameraActive,
    startCamera,
    stopCamera,
    isModelReady,
    isCameraInitializing,
    cameraError,
    isPermissionModalOpen,
    setIsPermissionModalOpen,
    isPostureAlertOpen,
    setIsPostureAlertOpen,
    liveMetrics,
    sessionMetrics,
    primaryRecommendation,
    rankedCandidates,
    multiPersonWarning,
    showSkeleton,
    setShowSkeleton,
    showBoundingBox,
    setShowBoundingBox,
    demoPerson,
    setDemoPerson,
    demoPosture,
    setDemoPosture,
    demoMovement,
    setDemoMovement,
    demoStationaryMin,
    setDemoStationaryMin,
    demoScreenMin,
    setDemoScreenMin,
    applyDemoPreset,
    snoozeRecommendation,
    dismissRecommendation,
    activeExercise,
    isExerciseModalOpen,
    setIsExerciseModalOpen,
    startExercise,
    completeExercise,
    isCalibrationOpen,
    setIsCalibrationOpen,
    isHydrationAlertOpen,
    confirmHydration,
    snoozeHydration,
    logQuickHydration
  } = useMonitoring();

  const handleToggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleStartDemoFromModal = () => {
    updateSettings({ demoMode: true });
    setIsPermissionModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Primary Static Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMonitoringActive={isCameraActive || settings.demoMode}
        postureState={liveMetrics.postureState}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          settings={settings}
          onUpdateSettings={updateSettings}
          postureState={liveMetrics.postureState}
          onOpenCalibration={() => setIsCalibrationOpen(true)}
          isCameraActive={isCameraActive}
          onToggleCamera={handleToggleCamera}
        />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
          {/* Persistent Tab Mounting: Keeps Video and Canvas alive when changing sections */}
          <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
            <Dashboard
              metrics={liveMetrics}
              session={sessionMetrics}
              recommendation={primaryRecommendation}
              onStartExercise={startExercise}
              onSnoozeRecommendation={snoozeRecommendation}
              onDismissRecommendation={dismissRecommendation}
              onOpenCalibration={() => setIsCalibrationOpen(true)}
              onNavigateToMonitor={() => setActiveTab('monitor')}
              onNavigateToExercises={() => setActiveTab('exercises')}
              isCameraActive={isCameraActive}
              onToggleCamera={handleToggleCamera}
              isDemoMode={settings.demoMode}
              onLogHydration={logQuickHydration}
            />
          </div>

          <div className={activeTab === 'monitor' ? 'block' : 'hidden'}>
            <LiveMonitor
              videoRef={videoRef}
              canvasRef={canvasRef}
              isCameraActive={isCameraActive}
              onToggleCamera={handleToggleCamera}
              cameraError={cameraError}
              metrics={liveMetrics}
              multiPersonWarning={multiPersonWarning}
              onOpenCalibration={() => setIsCalibrationOpen(true)}
              showSkeleton={showSkeleton}
              onToggleSkeleton={setShowSkeleton}
              showBoundingBox={showBoundingBox}
              onToggleBoundingBox={setShowBoundingBox}
            />
          </div>

          <div className={activeTab === 'recommendations' ? 'block' : 'hidden'}>
            <Recommendations
              primaryRecommendation={primaryRecommendation}
              rankedCandidates={rankedCandidates}
              onStartExercise={startExercise}
              onSnoozeRecommendation={snoozeRecommendation}
              onDismissRecommendation={dismissRecommendation}
            />
          </div>

          <div className={activeTab === 'exercises' ? 'block' : 'hidden'}>
            <Exercises onStartExercise={startExercise} />
          </div>

          <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
            <Analytics session={sessionMetrics} />
          </div>

          <div className={activeTab === 'history' ? 'block' : 'hidden'}>
            <History />
          </div>

          <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
            <Settings
              settings={settings}
              onUpdateSettings={updateSettings}
              calibration={calibration}
              onOpenCalibration={() => setIsCalibrationOpen(true)}
            />
          </div>

          {/* Developer / Algorithmic Debug Panel */}
          <div className="pt-6 border-t border-slate-900">
            <DeveloperPanel
              metrics={liveMetrics}
              candidates={rankedCandidates}
              showSkeleton={showSkeleton}
              onToggleSkeleton={setShowSkeleton}
              showBoundingBox={showBoundingBox}
              onToggleBoundingBox={setShowBoundingBox}
            />
          </div>
        </main>
      </div>

      {/* Camera Permission & Onboarding Modal */}
      <CameraPermissionModal
        isOpen={isPermissionModalOpen && !isCameraActive && !settings.demoMode}
        onAllowCamera={startCamera}
        onStartDemo={handleStartDemoFromModal}
        onDismiss={() => setIsPermissionModalOpen(false)}
        isInitializing={isCameraInitializing}
        cameraError={cameraError}
      />

      {/* Real-Time Posture Warning Toast */}
      <PostureAlertToast
        isOpen={isPostureAlertOpen}
        postureState={liveMetrics.postureState}
        onDismiss={() => setIsPostureAlertOpen(false)}
        onStartReset={() => {
          setIsPostureAlertOpen(false);
          setActiveTab('exercises');
        }}
        headAngle={liveMetrics.posture.forwardHeadAngle}
        slouchScore={liveMetrics.posture.slouchScore}
      />

      {/* Modals & Overlays */}
      <ExerciseRunnerModal
        exercise={activeExercise}
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onComplete={completeExercise}
        currentPostureState={liveMetrics.postureState}
      />

      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        onSaveCalibration={updateCalibration}
        currentLandmarks={liveMetrics.landmarks}
        isPersonDetected={liveMetrics.presence === 'DETECTED'}
      />

      <HydrationModal
        isOpen={isHydrationAlertOpen}
        onConfirm={confirmHydration}
        onSnooze={snoozeHydration}
        workMinutes={Math.floor(sessionMetrics.workDurationSec / 60)}
      />

      {/* Demo Mode Floating Controller */}
      <DemoToolbar
        isDemoActive={settings.demoMode}
        onToggleDemo={(val) => updateSettings({ demoMode: val })}
        demoPerson={demoPerson}
        onSetDemoPerson={setDemoPerson}
        demoPosture={demoPosture}
        onSetDemoPosture={setDemoPosture}
        demoMovement={demoMovement}
        onSetDemoMovement={setDemoMovement}
        demoStationaryMin={demoStationaryMin}
        onSetDemoStationaryMin={setDemoStationaryMin}
        demoScreenMin={demoScreenMin}
        onSetDemoScreenMin={setDemoScreenMin}
        onApplyPreset={applyDemoPreset}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMonitoringActive={isCameraActive || settings.demoMode}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
      />
    </div>
  );
}
