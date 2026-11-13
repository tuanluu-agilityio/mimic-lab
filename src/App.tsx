import { Nav } from '@/components/Nav';
import { AnatomyStage } from '@/features/anatomy/AnatomyStage';
import { Hotspots } from '@/features/anatomy/Hotspots';
import { IntroStage } from '@/features/intro/IntroStage';
import { MechanismStage } from '@/features/mechanisms/MechanismStage';
import { MimicryStage } from '@/features/mimicry/MimicryStage';
import { SourcesStage } from '@/features/sources/SourcesStage';
import { LoadingOverlay } from '@/features/viewer/LoadingOverlay';
import { Viewer } from '@/features/viewer/Viewer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useStageObserver } from '@/hooks/useStageObserver';

export function App() {
  useStageObserver();
  useReducedMotion();
  return (
    <>
      <a className="skip-link" href="#stage-anatomy">
        Skip to content
      </a>
      <Viewer />
      <Hotspots />
      <Nav />
      <main>
        <IntroStage />
        <AnatomyStage />
        <MechanismStage />
        <MimicryStage />
        <SourcesStage />
      </main>
      <LoadingOverlay />
    </>
  );
}
