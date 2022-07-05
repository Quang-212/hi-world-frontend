// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import Settings from './components/settings';
import RtlLayout from './components/RtlLayout';
import ScrollToTop from './components/ScrollToTop';
import { ProgressBarStyle } from './components/ProgressBar';
import ThemeColorPresets from './components/ThemeColorPresets';
import MotionLazyContainer from './components/animate/MotionLazyContainer';
import NotistackProvider from './components/NotistackProvider';
import { useRecoilState } from 'recoil';
import Authentication from './recoils/user/auth';
import { getAuthenticationState } from './api/authentication.api';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

export default function App() {
  const [{ user }, setAuthState] = useRecoilState(Authentication);
  useEffect(() => {
    const init = async () => {
      const auth = await getAuthenticationState();
      setAuthState((prev) => ({ ...prev, isAuthenticated: auth?.authenticated }));
    };
    if (user?._id) {
      init();
    }
  }, []);
  return (
    <ThemeProvider>
      <ThemeColorPresets>
        <RtlLayout>
          <NotistackProvider>
            <MotionLazyContainer>
              <ProgressBarStyle />

              <Settings />
              <ScrollToTop />
              <Router />
            </MotionLazyContainer>
          </NotistackProvider>
        </RtlLayout>
      </ThemeColorPresets>
    </ThemeProvider>
  );
}
