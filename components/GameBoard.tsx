'use client';
import { useRef, useEffect } from 'react';
import { GameState } from '@/hooks/useGame';
import { PLAYER_COLORS, TileData } from '@/lib/data';

const ORDER = [
  20,21,22,23,24,25,26,27,28,29,30,
  19,-1,-1,-1,-1,-1,-1,-1,-1,-1,31,
  18,-1,-1,-1,-1,-1,-1,-1,-1,-1,32,
  17,-1,-1,-1,-1,-1,-1,-1,-1,-1,33,
  16,-1,-1,-1,-1,-1,-1,-1,-1,-1,34,
  15,-1,-1,-1,-1,-1,-1,-1,-1,-1,35,
  14,-1,-1,-1,-1,-1,-1,-1,-1,-1,36,
  13,-1,-1,-1,-1,-1,-1,-1,-1,-1,37,
  12,-1,-1,-1,-1,-1,-1,-1,-1,-1,38,
  11,-1,-1,-1,-1,-1,-1,-1,-1,-1,39,
  10,9,8,7,6,5,4,3,2,1,0,
];

function tileName(t: TileData) {
  const short: Record<string, string> = {
    'Mediterranean Avenue': 'Mediterranean', 'Baltic Avenue': 'Baltic', 'Oriental Avenue': 'Oriental',
    'Vermont Avenue': 'Vermont', 'Connecticut Avenue': 'Connecticut', "St. Charles Place": 'St. Charles',
    'States Avenue': 'States', 'Virginia Avenue': 'Virginia', 'St. James Place': 'St. James',
    'Tennessee Avenue': 'Tennessee', 'New York Avenue': 'New York', 'Kentucky Avenue': 'Kentucky',
    'Indiana Avenue': 'Indiana', 'Illinois Avenue': 'Illinois', 'Atlantic Avenue': 'Atlantic',
    'Ventnor Avenue': 'Ventnor', 'Marvin Gardens': 'Marvin', 'Pacific Avenue': 'Pacific',
    'North Carolina Avenue': 'N. Carolina', 'Pennsylvania Avenue': 'Penn Ave', 'Park Place': 'Park Place',
    'Boardwalk': 'Boardwalk', 'Reading Railroad': 'Reading RR', 'Pennsylvania Railroad': 'Penn RR',
    'B. & O. Railroad': 'B&O RR', 'Short Line': 'Short Line', 'Electric Company': 'Electric',
    'Water Works': 'Water Works', 'Income Tax': 'Income Tax', 'Luxury Tax': 'Luxury Tax',
    'Community Chest': 'Community\nChest', 'Chance': 'Chance',
    'Free Parking': 'Free\nParking', 'Go to Jail': 'Go To\nJail', 'Jail / Just Visiting': 'In Jail /\nJust Visiting',
    'Go': 'GO',
  };
  return short[t.name] || t.name;
}

function CornerTile({ t, tid }: { t: TileData; tid: number }) {
  if (tid === 0) return (
    <div className="tile-corner">
      <div className="corner-go">
        <svg viewBox="0 0 40 40" width="22" height="22"><polygon points="20,2 38,38 2,38" fill="var(--accent1)"/><text x="20" y="30" textAnchor="middle" fontSize="12" fill="#000" fontWeight="bold">GO</text></svg>
        <div style={{ fontSize: '9px', fontFamily: 'var(--pixel)', color: 'var(--accent1)', fontWeight: 700 }}>COLLECT $200</div>
      </div>
    </div>
  );
  if (tid === 10) return (
    <div className="tile-corner">
      <div className="corner-jail">
        <svg viewBox="0 0 40 40" width="26" height="26"><rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="var(--accent2)" strokeWidth="3"/><line x1="12" y1="4" x2="12" y2="36" stroke="var(--accent2)" strokeWidth="2"/><line x1="20" y1="4" x2="20" y2="36" stroke="var(--accent2)" strokeWidth="2"/><line x1="28" y1="4" x2="28" y2="36" stroke="var(--accent2)" strokeWidth="2"/></svg>
        <div style={{ fontSize: '8px', fontFamily: 'var(--pixel)', color: 'var(--accent2)' }}>JAIL</div>
      </div>
    </div>
  );
  if (tid === 20) return (
    <div className="tile-corner">
      <div className="corner-parking">
        <svg viewBox="0 0 40 40" width="24" height="24"><circle cx="20" cy="20" r="16" fill="var(--accent2)"/><text x="20" y="24" textAnchor="middle" fontSize="10" fill="#000" fontWeight="bold">P</text></svg>
        <div style={{ fontSize: '8px', fontFamily: 'var(--pixel)', color: 'var(--accent2)' }}>FREE PARKING</div>
      </div>
    </div>
  );
  if (tid === 30) return (
    <div className="tile-corner">
      <div className="corner-gotojail">
        <svg viewBox="0 0 40 40" width="24" height="24"><polygon points="2,38 20,2 38,38" fill="none" stroke="var(--danger)" strokeWidth="3"/><text x="20" y="28" textAnchor="middle" fontSize="8" fill="var(--danger)" fontWeight="bold">JAIL</text></svg>
        <div style={{ fontSize: '8px', fontFamily: 'var(--pixel)', color: 'var(--danger)' }}>GO TO JAIL</div>
      </div>
    </div>
  );
  return null;
}

function SpecialTile({ t }: { t: TileData }) {
  if (t.type === 'chance') return (
    <div className="tile-special">
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent1)', fontFamily: 'var(--pixel)' }}>?</div>
      <div className="tile-special-name" style={{ color: 'var(--accent1)' }}>CHANCE</div>
    </div>
  );
  if (t.type === 'community') return (
    <div className="tile-special">
      <div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#000', fontFamily: 'var(--pixel)' }}>CC</div>
      <div className="tile-special-name" style={{ color: 'var(--accent2)' }}>COMMUNITY</div>
    </div>
  );
  if (t.type === 'tax') return (
    <div className="tile-special">
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', fontFamily: 'var(--pixel)' }}>$</div>
      <div className="tile-special-name" style={{ color: 'var(--danger)' }}>{t.name}</div>
      <div className="tile-special-price">{t.percent ? '10% or $200' : `$${t.amount}`}</div>
    </div>
  );
  if (t.type === 'railroad') return (
    <div className="tile-special">
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--pixel)' }}>🚂</div>
      <div className="tile-special-name">{t.name}</div>
      <div className="tile-special-price">$200</div>
    </div>
  );
  if (t.type === 'utility') return (
    <div className="tile-special">
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--pixel)' }}>⚡</div>
      <div className="tile-special-name">{t.name}</div>
      <div className="tile-special-price">$150</div>
    </div>
  );
  return null;
}

function StreetTile({ t }: { t: TileData }) {
  return (
    <div className="tile-street">
      <div className="tile-street-bar" style={{ background: t.color }} />
      <div className="tile-street-name">{t.name}</div>
      <div className="tile-street-price">${t.price}</div>
    </div>
  );
}

export function GameBoard({ state }: { state: GameState }) {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boardRef.current) return;
    const r = boardRef.current.getBoundingClientRect();
    state.players.forEach((pl, i) => {
      const el = document.getElementById(`token-${i}`);
      const tileEl = boardRef.current?.querySelector<HTMLElement>(`.tile[data-id="${pl.pos}"]`);
      if (!el || !tileEl) return;
      const tr = tileEl.getBoundingClientRect();
      const offset = (i * 4) % 12;
      el.style.left = (tr.left - r.left + 6 + offset) + 'px';
      el.style.top = (tr.top - r.top + 6 + offset) + 'px';
      el.style.width = (tr.width / 2.2) + 'px';
      el.style.height = (tr.width / 2.2) + 'px';
    });
  }, [state.players]);

  return (
    <div className="monopoly-board" ref={boardRef}>
      {ORDER.map((tid, idx) => {
        const col = (idx % 11) + 1;
        const row = Math.floor(idx / 11) + 1;
        if (tid === -1) {
          return <div key={idx} className="tile-center" style={{ gridColumn: col, gridRow: row }} />;
        }
        const t = state.tiles[tid];
        const isCorner = [0, 10, 20, 30].includes(tid);
        const isSpecial = t.type === 'chance' || t.type === 'community' || t.type === 'tax' || t.type === 'railroad' || t.type === 'utility';
        const isStreet = t.type === 'street';
        return (
          <div
            key={tid}
            className={`tile ${isCorner ? 'tile-corner' : ''} ${isSpecial ? 'tile-special' : ''} ${isStreet ? 'tile-street' : ''}`}
            data-id={tid}
            style={{ gridColumn: col, gridRow: row }}
          >
            {isCorner && <CornerTile t={t} tid={tid} />}
            {isSpecial && <SpecialTile t={t} />}
            {isStreet && <StreetTile t={t} />}
            <div className="tile-owners">
              {t.owner != null && (
                <div className="tile-owner-dot" style={{ background: PLAYER_COLORS[t.owner] }} />
              )}
            </div>
            <div className="tile-houses">
              {t.houses != null && t.houses > 0 && t.houses < 5 && Array.from({ length: t.houses }).map((_, i) => (
                <div key={i} className="tile-house" />
              ))}
              {t.houses != null && t.houses >= 5 && (
                <div className="tile-hotel" />
              )}
            </div>
          </div>
        );
      })}
      {state.players.map((pl, i) => (
        <div key={i} id={`token-${i}`} className={`token p${i}`} />
      ))}
    </div>
  );
}
