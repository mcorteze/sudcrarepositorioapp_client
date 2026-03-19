import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Badge } from 'antd';
import './App.css';

const { Text } = Typography;

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const fmt = (isoStr) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const StatusBadge = ({ marcaTemporal }) => {
    const isLive = marcaTemporal ? (new Date() - new Date(marcaTemporal)) / 60000 < 6 : false;
    const color = isLive ? '#28a745' : '#dc3545'; 
    const glowColor = isLive ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ 
                width: 7, 
                height: 7, 
                borderRadius: '50%', 
                backgroundColor: color, 
                boxShadow: `0 0 8px ${glowColor}`,
                animation: isLive ? 'pulse 2s infinite' : 'none' 
            }} />
            <span style={{ 
                fontSize: 11, 
                fontWeight: 300, 
                color: color,
                textShadow: `0 0 4px ${glowColor}`,
                letterSpacing: '0.5px'
            }}>
                {isLive ? 'Live' : 'Off'}
            </span>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

const FormsCard = ({ title, log, idLocal, lecturaForm }) => {
    if (!log) return null;
    const idRegistrado = lecturaForm?.imagen_recepcionada ?? '-';
    const idCalificado = lecturaForm?.imagen_calificada ?? '-';
    const marcaCalif = lecturaForm?.marca_temporal_calificacion;

    return (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: '10px 14px', minWidth: '100%', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, color: '#34495e' }}>{title}</Text>
                <StatusBadge marcaTemporal={log.marca_temporal} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 8 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#888' }}>reg.</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#2e86c1' }}>{idRegistrado}</div>
                </div>
                <div style={{ fontSize: 14, color: '#aaa' }}>→</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#888' }}>local</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#239b56' }}>{idLocal ?? '-'}</div>
                </div>
                <div style={{ fontSize: 14, color: '#aaa' }}>→</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#888' }}>calif.</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#b7950b' }}>{idCalificado}</div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>
                <span>Transfer: <b>{log.archivos_transfer ?? '-'}</b></span>
                <span>Prep: <b>{log.imagenes_preparacion ?? '-'}</b></span>
            </div>
        </div>
    );
};

const SudcraCard = ({ log }) => {
    if (!log) return null;
    return (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: '10px 14px', width: '100%', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 13, color: '#34495e' }}>sudcra</Text>
                <StatusBadge marcaTemporal={log.marca_temporal || log.tickets_hora || log.id_lista_sharepoint_hora} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#888' }}>
                    Tickets: <b style={{ fontSize: 16, color: log.tickets_pendientes > 0 ? '#922b21' : '#239b56' }}>{log.tickets_pendientes ?? '-'}</b>
                </span>
                <span style={{ fontSize: 10, color: '#888' }}>{log.id_lista_sharepoint}</span>
            </div>
        </div>
    );
};

const PendientesCard = ({ data }) => {
    const items = [
        { label: 'Aprobación', count: data.pendAprob, color: '#a93226' }, 
        { label: 'Mail Sección', count: data.pendMailSecc, color: '#ba4a00' }, 
        { label: 'Mail Alumnos', count: data.pendMailAlum, color: '#af601a' }, 
        { label: 'Sin Inscritos', count: data.sinInscritos, color: '#117864' }, 
    ];

    return (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: '12px', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {items.map((item) => (
                    <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 10, color: '#5d6d7e' }}>{item.label}</span>
                        <b style={{ fontSize: 18, color: item.count > 0 ? item.color : '#239b56' }}>{item.count ?? 0}</b>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ActivityTable = ({ title, data, color }) => {
    const rows = useMemo(() => {
        return [...data].sort((a, b) => b.hora.localeCompare(a.hora));
    }, [data]);

    return (
        <div style={{ background: '#fff', padding: '10px', borderRadius: 6, border: '1px solid #ddd', width: '100%', marginBottom: 15 }}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color }}>{title}</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <th style={{ textAlign: 'left', padding: '4px', color: '#888', fontWeight: 'normal' }}>Hora</th>
                        <th style={{ textAlign: 'right', padding: '4px', color: '#888', fontWeight: 'normal' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.slice(0, 10).map(r => (
                        <tr key={r.hora} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '4px' }}>{r.hora}</td>
                            <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold', color }}>{r.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const App = () => {
    const [logs, setLogs] = useState([]);
    const [idListaData, setIdListaData] = useState([]);
    const [lecturasForm, setLecturasForm] = useState([]);
    const [statsCalificaciones, setStatsCalificaciones] = useState([]);
    const [statsInformes, setStatsInformes] = useState([]);
    const [pendientes, setPendientes] = useState({ pendAprob: 0, pendMailSecc: 0, pendMailAlum: 0, sinInscritos: 0 });

    const fetchAllData = async () => {
        try {
            const [logsRes, idListaRes, lecturasRes, statsCalifRes, statsInfRes, pendARes, pendMSRes, pendMARes, sinIRes] = await Promise.all([
                fetch(`${API}/api/logs`),
                fetch(`${API}/api/ultimo_idlista`),
                fetch(`${API}/api/ultimas-lecturas-form-2`),
                fetch(`${API}/api/stats/calificaciones`),
                fetch(`${API}/api/stats/informes`),
                fetch(`${API}/api/informes/pendientes`),
                fetch(`${API}/api/informes/pendientes-mail`),
                fetch(`${API}/api/informes/pendientes-mail-alumnos`),
                fetch(`${API}/api/secciones_sin_inscritos`),
            ]);
            setLogs(await logsRes.json());
            setIdListaData(await idListaRes.json());
            setLecturasForm(await lecturasRes.json());
            setStatsCalificaciones(await statsCalifRes.json());
            setStatsInformes(await statsInfRes.json());

            const getC = async (r) => { const d = await r.json(); return d.count || 0; };
            setPendientes({
                pendAprob: await getC(pendARes),
                pendMailSecc: await getC(pendMSRes),
                pendMailAlum: await getC(pendMARes),
                sinInscritos: await getC(sinIRes)
            });
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, []);

    const latestByEquipo = useMemo(() => {
        const map = {};
        for (const log of logs) { if (!map[log.nombre_equipo]) map[log.nombre_equipo] = log; }
        return map;
    }, [logs]);

    return (
        <div style={{ padding: '15px', background: '#f4f6f7', minHeight: '100vh' }}>
            <div style={{ marginBottom: 20 }}>
                <Text strong style={{ fontSize: 18, color: '#2c3e50', display: 'block' }}>SUDCRA Cloud</Text>
                <div style={{ height: 2, width: 40, background: '#2e86c1', marginTop: 4 }}></div>
            </div>

            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10, color: '#555' }}>Informes pendientes</Text>
            <div style={{ marginBottom: 25 }}><PendientesCard data={pendientes} /></div>

            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10, color: '#555' }}>Monitor de Procesos</Text>
            <div style={{ marginBottom: 25 }}>
                <FormsCard title="forms_ingles" log={latestByEquipo['forms_ingles(Len_parciales)']} idLocal={idListaData.find(r=>r.cod_programa==='len')?.id_lista} lecturaForm={lecturasForm.find(r=>r.cod_programa==='len')} />
                <FormsCard title="forms_len" log={latestByEquipo['forms_len(Mat_parciales)']} idLocal={idListaData.find(r=>r.cod_programa==='mat')?.id_lista} lecturaForm={lecturasForm.find(r=>r.cod_programa==='mat')} />
                <SudcraCard log={latestByEquipo['sudcra']} />
            </div>

            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10, color: '#555' }}>Actividad (Hoy)</Text>
            <ActivityTable title="Calificaciones" data={statsCalificaciones} color="#2e86c1" />
            <ActivityTable title="Informes" data={statsInformes} color="#239b56" />
            
            <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 10, color: '#aaa' }}>
                Sincronizado: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
};

export default App;
