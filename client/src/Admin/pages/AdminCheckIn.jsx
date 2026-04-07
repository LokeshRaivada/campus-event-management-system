import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CheckCircle2, XCircle, User, Calendar, ShieldCheck, RefreshCw, Loader2, Camera } from 'lucide-react';
import { validateTicket } from '../../services/registrationService';
import { useToast } from '../../components/ui/Toast';

export default function AdminCheckIn() {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const { addToast } = useToast();
    const scannerRef = useRef(null);
    const lastScanRef = useRef(0);
    const isTransitioningRef = useRef(false);

    // Initialize scanner instance once
    useEffect(() => {
        let mounted = true;
        
        const init = async () => {
            if (isTransitioningRef.current) return;
            isTransitioningRef.current = true;

            try {
                // Cleanup any existing instance first
                if (scannerRef.current && scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }

                if (!mounted) return;

                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;
                
                // Allow a small pause before re-starting if needed
                await startScanner();
            } catch (e) {
                console.error("Init scanner error:", e);
            } finally {
                isTransitioningRef.current = false;
            }
        };

        if (mounted) {
            init();
        }

        return () => {
            mounted = false;
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const startScanner = async () => {
        if (!scannerRef.current) return;
        if (scannerRef.current.isScanning) return;
        
        try {
            setIsScanning(true);
            setScanResult(null);

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const size = Math.floor(minEdge * 0.7);
                        return { width: size, height: size };
                    },
                    aspectRatio: 1.333333
                },
                (decodedText) => {
                    const now = Date.now();
                    if (now - lastScanRef.current < 2500) return;
                    
                    console.log("✅ QR DETECTED:", decodedText);
                    lastScanRef.current = now;
                    handleScan(decodedText);
                },
                (errorMessage) => {
                    // Frame error (ignore)
                }
            );
            setCameraReady(true);
        } catch (err) {
            console.error("Scanner start error:", err);
            addToast("Could not access camera", "error");
            setIsScanning(false);
        }
    };

    const handleScan = async (decodedText) => {
        setLoading(true);
        try {
            const res = await validateTicket(decodedText);
            if (res.success) {
                setScanResult({
                    status: 'SUCCESS',
                    message: res.message,
                    studentName: res.studentName,
                    event: res.event
                });
                addToast('Access Granted ✅', 'success');
            } else {
                setScanResult({
                    status: 'ERROR',
                    message: res.message || 'Verification failed',
                    studentName: res.studentName
                });
                addToast('Invalid or Already Used ❌', 'error');
            }
        } catch (err) {
            console.error("Validation error:", err);
            addToast('Validation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-rise">
            <style>
                {`
                #reader video {
                    width: 100% !important;
                    height: auto !important;
                    border-radius: 20px;
                    object-fit: cover !important;
                }
                #reader {
                    border: none !important;
                }
                #reader__scan_region {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                }
                `}
            </style>
            <header className="section-header">
                <h1>Event Entry Validation</h1>
                <p className="muted">Fast and reliable QR check-in for registered students</p>
            </header>

            <div className="sa-content-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 400px' }}>
                {/* Scanner Section */}
                <div className="sa-card glass" style={{ 
                    minHeight: '450px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div className="card-badge" style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
                        <span className={`sa-status-badge ${isScanning ? 'success' : 'neutral'}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className={`pulse-dot ${isScanning ? 'active' : ''}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
                            {isScanning ? 'Scanner Active' : 'Scanner Off'}
                        </span>
                    </div>

                    <div id="reader" style={{ 
                        width: '100%', 
                        maxWidth: '450px', 
                        borderRadius: '24px', 
                        overflow: 'hidden',
                        background: '#000',
                        boxShadow: 'var(--shadow-xl)',
                        border: '4px solid var(--border-default)'
                    }}></div>

                    {!cameraReady && isScanning && (
                        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <Loader2 className="animate-spin text-brand" size={48} />
                            <p className="sa-eyebrow">Initializing Camera...</p>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <p className="sa-muted" style={{ fontSize: '13px' }}>
                            Point camera at the student's entry pass QR code
                        </p>
                    </div>
                </div>

                {/* Status & Info Panel */}
                <div className="sa-card glass" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ShieldCheck className="text-brand" />
                            <h3 style={{ margin: 0 }}>Scan Status</h3>
                        </div>
                        {loading && <Loader2 className="animate-spin text-brand" size={20} />}
                    </div>

                    <div style={{ padding: '24px', flex: 1 }}>
                        {!scanResult ? (
                            <div style={{ height: '300px', border: '2px dashed var(--border-default)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                <QrCode size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                <p style={{ fontWeight: '500' }}>Ready to Scan</p>
                            </div>
                        ) : (
                            <div className="scan-result-content">
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    padding: '32px', 
                                    background: scanResult.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                    borderRadius: '24px',
                                    border: `1px solid ${scanResult.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                    marginBottom: '24px'
                                }}>
                                    {scanResult.status === 'SUCCESS' ? (
                                        <CheckCircle2 size={56} color="#10b981" />
                                    ) : (
                                        <XCircle size={56} color="#ef4444" />
                                    )}
                                    <h2 style={{ marginTop: '16px', color: scanResult.status === 'SUCCESS' ? '#059669' : '#dc2626' }}>
                                        {scanResult.status === 'SUCCESS' ? 'Access Granted' : 'Access Denied'}
                                    </h2>
                                    <p className="sa-muted" style={{ textAlign: 'center', marginTop: '8px' }}>{scanResult.message}</p>
                                </div>

                                <div className="sa-list">
                                    <div className="sa-list-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: '12px' }}><User size={18} /></div>
                                            <div>
                                                <p className="sa-eyebrow">Student</p>
                                                <p style={{ fontWeight: '600' }}>{scanResult.studentName || 'Not Found'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sa-list-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: '12px' }}><Calendar size={18} /></div>
                                            <div>
                                                <p className="sa-eyebrow">Event</p>
                                                <p style={{ fontWeight: '600' }}>{scanResult.event || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
