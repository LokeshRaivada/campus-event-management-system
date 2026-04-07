import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, MapPin, Clock, User, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getTicket } from '../../services/registrationService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export default function StudentEntryPass() {
    const { eventId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTicket() {
            const data = await getTicket(eventId);
            setTicket(data);
            setLoading(false);
        }
        loadTicket();
    }, [eventId]);

    if (loading) {
        return (
            <div className="sa-dashboard-main">
                <LoadingSkeleton variant="card" height="500px" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="sa-card glass" style={{ padding: '48px', textAlign: 'center' }}>
                <Ticket size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h3>No Ticket Found</h3>
                <p className="sa-muted">You haven't registered for this event yet.</p>
                <Link to="/student/events" className="primary-btn sa-compact" style={{ marginTop: '20px' }}>Browse Events</Link>
            </div>
        );
    }

    const handleDownload = () => {
        const svg = document.getElementById("qr-code-svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${ticket.title.replace(/\s+/g, '_')}_Ticket.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="animate-rise">
            <header className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/student/my-events" className="ghost-btn sa-compact">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1>Entry Pass</h1>
                    <p className="muted">Show this QR code at the event entrance</p>
                </div>
            </header>

            <div className="sa-content-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
                {/* Main Pass */}
                <div className="sa-card glass hover-gradient-border" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--brand-linear)', height: '10px' }} />
                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        
                        <div className="ticket-qr-box" style={{ 
                            background: '#fff', 
                            padding: '20px', 
                            borderRadius: '16px', 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            marginBottom: '24px'
                        }}>
                            <QRCodeSVG 
                                id="qr-code-svg"
                                value={ticket.ticket_token} 
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{ticket.title}</h2>
                            <span className={`sa-tag ${ticket.attendance_status === 'CHECKED_IN' ? 'sa-tag-approved' : 'sa-tag-pending'}`}>
                                {ticket.attendance_status === 'CHECKED_IN' ? 'CHECKED IN' : 'VALID ENTRY'}
                            </span>
                        </div>

                        <div className="ticket-details-grid" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '24px', 
                            width: '100%',
                            borderTop: '1px dashed var(--border)',
                            paddingTop: '24px'
                        }}>
                            <div className="meta-item">
                                <User size={16} className="text-brand" />
                                <div>
                                    <p className="sa-eyebrow" style={{ margin: 0 }}>Student</p>
                                    <p style={{ fontWeight: '600' }}>{ticket.studentName}</p>
                                </div>
                            </div>
                            <div className="meta-item">
                                <Calendar size={16} className="text-brand" />
                                <div>
                                    <p className="sa-eyebrow" style={{ margin: 0 }}>Date</p>
                                    <p style={{ fontWeight: '600' }}>{new Date(ticket.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="meta-item">
                                <Clock size={16} className="text-brand" />
                                <div>
                                    <p className="sa-eyebrow" style={{ margin: 0 }}>Time</p>
                                    <p style={{ fontWeight: '600' }}>{ticket.time}</p>
                                </div>
                            </div>
                            <div className="meta-item">
                                <MapPin size={16} className="text-brand" />
                                <div>
                                    <p className="sa-eyebrow" style={{ margin: 0 }}>Venue</p>
                                    <p style={{ fontWeight: '600' }}>{ticket.venue}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="sa-card glass" style={{ padding: '24px' }}>
                        <h4 style={{ marginBottom: '16px' }}>Actions</h4>
                        <button className="primary-btn" onClick={handleDownload} style={{ width: '100%', marginBottom: '12px' }}>
                            <Download size={18} /> Save as Image
                        </button>
                        <button className="ghost-btn" onClick={() => window.print()} style={{ width: '100%' }}>
                            Print Pass
                        </button>
                    </div>

                    <div className="sa-card glass" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <CheckCircle2 size={24} className="text-success" />
                            <div>
                                <h5 style={{ margin: 0 }}>Instructions</h5>
                                <p className="sa-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                                    Please present this QR code at the venue for check-in. This pass is unique to your registration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
