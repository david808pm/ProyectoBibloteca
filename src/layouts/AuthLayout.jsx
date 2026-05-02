import React from "react";

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
