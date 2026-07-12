import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';

export const SignupPage: React.FC = () => {
  return (
    <Card className="w-full max-w-md border border-base-300 shadow-xl bg-base-100/90 backdrop-blur-md">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/25 mb-3">
          A
        </div>
        <h2 className="text-2xl font-bold text-base-content tracking-tight">Create your Account</h2>
        <p className="text-sm text-base-content/60 mt-1">Get started with AssetFlow ERP</p>
      </div>

      <div className="alert alert-warning flex flex-col items-center gap-3 p-6 text-center rounded-xl bg-warning/10 border border-warning/20 text-warning-content">
        <div className="p-3 bg-warning/20 rounded-full text-warning">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-warning">Registration Restricted</h3>
          <p className="text-sm opacity-90 leading-relaxed text-base-content">
            Employee accounts are created by your organization's Administrator. Please contact your administrator.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to={ROUTES.LOGIN}>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            Back to Sign In
          </Button>
        </Link>
      </div>
    </Card>
  );
};
