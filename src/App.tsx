import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ConfirmRoles } from './pages/ConfirmRoles';
import { RoleIntake } from './pages/RoleIntake';
import { TAReviewSend } from './pages/TAReviewSend';
import { ManagerApprovals } from './pages/ManagerApprovals';
import { useStore } from './state/store';
import { useEffect } from 'react';
import candidatesData from '../data/candidates.json';
import rolesData from '../data/roles.json';
import interviewsData from '../data/interviews.json';
import pipelineData from '../data/pipeline.json';

function App() {
  const setCandidates = useStore((state) => state.setCandidates);
  const setRoles = useStore((state) => state.setRoles);
  const setInterviews = useStore((state) => state.setInterviews);
  const setPipeline = useStore((state) => state.setPipeline);

  // Load seed data on mount
  useEffect(() => {
    const state = useStore.getState();
    
    // Check if BA roles are missing
    const hasBARoles = state.roles.some(r => r.function === 'BA');
    
    if (state.candidates.length === 0) {
      setCandidates(candidatesData as any);
    }
    // Reload roles if empty OR if BA roles are missing
    if (state.roles.length === 0 || !hasBARoles) {
      setRoles(rolesData as any);
    }
    if (state.interviews.length === 0) {
      setInterviews(interviewsData as any);
    }
    if (state.pipeline.length === 0) {
      setPipeline(pipelineData as any);
    }
  }, [setCandidates, setRoles, setInterviews, setPipeline]);

  return (
    <BrowserRouter basename="/ai-allocation">
      <Layout>
        <Routes>
          <Route path="/" element={<ConfirmRoles />} />
          <Route path="/intake" element={<RoleIntake />} />
          <Route path="/review" element={<TAReviewSend />} />
          <Route path="/approvals" element={<ManagerApprovals />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
