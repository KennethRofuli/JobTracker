import React, { useState, useEffect } from 'react';
import './NotesModal.css';

function NotesModal({ application, onClose, onSave }) {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setNotes(application.notes || '');
    }
  }, [application]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(application._id, notes);
    setIsSaving(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === 'notes-modal-backdrop') {
      onClose();
    }
  };

  if (!application) return null;

  return (
    <div className="notes-modal-backdrop" onClick={handleBackdropClick}>
      <div className="notes-modal">
        <div className="notes-modal-header">
          <h3>Notes for {application.job_title}</h3>
          <button className="notes-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="notes-modal-subtitle">
          {application.company_name} • {application.location || 'Location not specified'}
        </div>
        
        <div className="notes-modal-body">
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this application...&#10;&#10;Examples:&#10;• Interview scheduled for Jan 15&#10;• Spoke with hiring manager John Smith&#10;• Follow up in 2 weeks&#10;• Technical assessment completed"
            autoFocus
          />
        </div>
        
        <div className="notes-modal-footer">
          <button className="notes-btn notes-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="notes-btn notes-btn-save" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotesModal;
