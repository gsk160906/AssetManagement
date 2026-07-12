import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-5 bg-primary/10 text-primary rounded-3xl animate-bounce duration-1000">
            <Compass size={60} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold text-primary tracking-tight">404</h1>
          <h2 className="text-2xl font-bold text-base-content tracking-tight">Page Not Found</h2>
          <p className="text-sm text-base-content/60 leading-relaxed">
            The resource you are trying to access doesn't exist, or you might have entered the wrong address.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
