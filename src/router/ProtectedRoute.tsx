import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthorized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthorized === false) {
      navigate('/login');
    }
  }, [isAuthorized]);

  if (isAuthorized === null) return <div>Loading...</div>;
  return <Outlet />;
}

export function RouteWithVoteId() {
  const params = new URLSearchParams(window.location.search)
  if (!params.has("voteId")) {
    window.location.href = "/backstage/vote";
  }
  return <Outlet />;
}