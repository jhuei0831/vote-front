import { useAuthCheck } from '../hooks/useAuthCheck';

export const AuthCheckWrapper = ({ children }: { children: React.ReactNode }) => {
  useAuthCheck();
  return <>{children}</>;
};