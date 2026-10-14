import React, { useState } from 'react';
export function IdentityReview({
  id,
  state,
  session,
  onChange,
}: {
  id: string;
  state: string;
  session: { role: string; csrf: string };
  onChange: () => void;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (session.role === 'viewer') return null;
  if (state === 'confirmed')
    return (
      <p className="notice">
        Source record identity confirmed. This does not approve any owner, status, purpose, or
        capital claim.
      </p>
    );
  async function confirm() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/v1/identities/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrf },
        body: JSON.stringify({ rationale: reason }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      onChange();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="proposal">
      <summary>Review candidate record identity</summary>
      <p>
        Confirm only this source-record identity from its explicit identifiers and archived
        evidence. Do not use a shared name or parcel as proof of a campus, owner, or parent.
        Unresolved site containers cannot be confirmed without canonical evidence;
        reparenting/merges remain deferred.
      </p>
      <label>
        Identity review rationale
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} />
      </label>
      <button disabled={busy || reason.trim().length < 10} onClick={confirm}>
        {busy ? 'Recording identity review…' : 'Confirm source identity'}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </details>
  );
}
