'use client';
import { useState } from 'react';
import { GameState, useGame } from '@/hooks/useGame';
import { Settings } from '@/lib/data';
import { t } from '@/lib/i18n';

export function TradeModal({ state, cfg, onClose, doTrade, addLog }: { state: GameState; cfg: Settings; onClose: () => void; doTrade: (oid: number, giveIds: number[], getIds: number[], giveCash: number, getCash: number) => void; addLog: (msg: string, type?: any) => void }) {
  const others = state.players.filter(pl => !pl.bankrupt && pl.id !== 0);
  const [selected, setSelected] = useState(others[0]?.id ?? 0);
  const [give, setGive] = useState<number[]>([]);
  const [get, setGet] = useState<number[]>([]);
  const [giveCash, setGiveCash] = useState(0);
  const [getCash, setGetCash] = useState(0);

  const p = state.players[0];
  const o = state.players.find(pl => pl.id === selected);
  if (!o) return null;

  const toggle = (arr: number[], setArr: (v: number[]) => void, id: number) => {
    if (arr.includes(id)) setArr(arr.filter(x => x !== id));
    else setArr([...arr, id]);
  };

  const submit = () => {
    if (giveCash > p.money) { addLog('Uang tidak cukup untuk trade.', 'bad'); return; }
    if (getCash > o.money) { addLog('Lawan tidak punya uang cukup.', 'bad'); return; }
    doTrade(selected, give, get, giveCash, getCash);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h2>{t(cfg.lang, 'trade')}</h2>
        <select value={selected} onChange={(e) => setSelected(parseInt(e.target.value))} style={{ width: '100%', marginBottom: 10, padding: 6, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6 }}>
          {others.map(pl => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
        </select>
        <div className="trade-grid">
          <div className="trade-list">
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>You give</div>
            <input type="number" value={giveCash} onChange={e => setGiveCash(parseInt(e.target.value) || 0)} min={0} max={p.money} style={{ width: '100%', marginBottom: 8, padding: 4, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4 }} />
            {p.properties.map(id => {
              const t = state.tiles[id];
              return (
                <div key={id} className={`trade-item ${give.includes(id) ? 'selected' : ''}`} onClick={() => toggle(give, setGive, id)}>
                  <div className="card-bar" style={{ background: t.color || 'var(--muted)', width: 8, height: 20, borderRadius: 2 }} />
                  <div style={{ fontSize: 11 }}>{t.name}</div>
                </div>
              );
            })}
          </div>
          <div className="trade-mid">
            <div style={{ fontSize: 18 }}>⇄</div>
          </div>
          <div className="trade-list">
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>You receive</div>
            <input type="number" value={getCash} onChange={e => setGetCash(parseInt(e.target.value) || 0)} min={0} max={o.money} style={{ width: '100%', marginBottom: 8, padding: 4, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4 }} />
            {o.properties.map(id => {
              const t = state.tiles[id];
              return (
                <div key={id} className={`trade-item ${get.includes(id) ? 'selected' : ''}`} onClick={() => toggle(get, setGet, id)}>
                  <div className="card-bar" style={{ background: t.color || 'var(--muted)', width: 8, height: 20, borderRadius: 2 }} />
                  <div style={{ fontSize: 11 }}>{t.name}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={submit}>{t(cfg.lang, 'confirm')}</button>
          <button className="btn btn-ghost" onClick={onClose}>{t(cfg.lang, 'cancel')}</button>
        </div>
      </div>
    </div>
  );
}
