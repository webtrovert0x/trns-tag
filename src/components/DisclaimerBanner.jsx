import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner" role="alert">
      <ShieldAlert size={22} className="disclaimer-icon" />
      <div className="disclaimer-text">
        <h4>Public Accounting & Audit Annotation Disclaimer</h4>
        <p>
          <strong>Tags are public annotations and subjective metadata, NOT cryptographic proof</strong> that a payment was legitimate, authorized, or correctly categorized.
          Auditors, DAOs, and businesses should treat transaction tags as contextual records and cross-verify with verified bank feeds, signed agreements, or multsig approval logs.
        </p>
      </div>
    </div>
  );
}
