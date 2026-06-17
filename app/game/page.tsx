'use client';
import { useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useGame } from '@/hooks/useGame';
import { GameBoard } from '@/components/GameBoard';
import { ActionBar } from '@/components/ActionBar';
import { Sidebar } from '@/components/Sidebar';
import { RightPanel } from '@/components/RightPanel';
import { Modal } from '@/components/Modal';
import { TradeModal } from '@/components/TradeModal';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { PLAYER_COLORS, Settings } from '@/lib/data';

type ActionDef = { label: string; fn: () => void; style: 'primary' | 'secondary' | 'danger' };

export default function GamePage() {
  const router = useRouter();
  const { cfg, mounted } = useSettings();
  const { state, doRollDice, doPayJail, doUseJailCard, doEndTurn, doBuy, doBuild, doMortgage, doUnmortgage, doTrade, closeModal, openModal, resetGame, togglePause, addLog } = useGame(cfg);
  const [tradeModal, setTradeModal] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', cfg.theme);
  }, [cfg.theme, mounted]);

  useEffect(() => {
    if (state.gameOver && !showGameOver) {
      setShowGameOver(true);
    }
  }, [state.gameOver, showGameOver]);

  if (!mounted) return <div className="bg-grid" />;

  const p = state.players[state.turn];
  if (!p) return null;

  const isHumanTurn = !p.isBot && !p.bankrupt && !state.gameOver && !state.paused && !state.waiting && !state.animating;
  const tile = state.tiles[p.pos];

  const humanActions = (): ActionDef[] => {
    if (!isHumanTurn) return [];
    if (p.jailed > 0) {
      const acts: ActionDef[] = [{ label: t(cfg.lang, 'pay50'), fn: doPayJail, style: 'primary' }];
      if (p.getOutCards > 0) acts.push({ label: t(cfg.lang, 'useCard'), fn: doUseJailCard, style: 'secondary' });
      acts.push({ label: t(cfg.lang, 'tryDouble'), fn: doRollDice, style: 'secondary' });
      return acts;
    }
    if (tile && tile.owner == null && (tile.type === 'street' || tile.type === 'railroad' || tile.type === 'utility') && p.money >= (tile.price || 0)) {
      return [
        { label: `${t(cfg.lang, 'buy')} ($${tile.price})`, fn: doBuy, style: 'primary' },
        { label: t(cfg.lang, 'pass'), fn: doEndTurn, style: 'secondary' },
      ];
    }
    return [{ label: t(cfg.lang, 'roll'), fn: doRollDice, style: 'primary' }];
  };

  const postActions = (): ActionDef[] => {
    if (!isHumanTurn) return [];
    const acts: ActionDef[] = [];
    const canBuild = p.properties.some(id => {
      const t = state.tiles[id];
      return !!t.group && t.owner === p.id && !t.mortgaged && (t.houses || 0) < 5 && !!t.houseCost && p.money >= t.houseCost;
    });
    const canMort = p.properties.some(id => {
      const t = state.tiles[id];
      return t.owner === p.id && !t.mortgaged && (t.houses || 0) === 0 && !!t.mortgage;
    });
    const canUnmort = p.properties.some(id => {
      const t = state.tiles[id];
      return t.owner === p.id && !!t.mortgaged && !!t.mortgage;
    });
    if (canBuild) acts.push({ label: t(cfg.lang, 'build'), fn: openBuildModal, style: 'secondary' });
    if (canMort) acts.push({ label: t(cfg.lang, 'mortgage'), fn: openMortModal, style: 'secondary' });
    if (canUnmort) acts.push({ label: t(cfg.lang, 'unmortgage'), fn: openUnmortModal, style: 'secondary' });
    acts.push({ label: t(cfg.lang, 'trade'), fn: () => setTradeModal(true), style: 'secondary' });
    acts.push({ label: t(cfg.lang, 'endTurn'), fn: doEndTurn, style: 'primary' });
    return acts;
  };

  function openBuildModal() {
    const candidates = p.properties.filter(id => {
      const t = state.tiles[id];
      return !!t.group && t.owner === p.id && !t.mortgaged && (t.houses || 0) < 5 && !!t.houseCost && p.money >= t.houseCost;
    }).sort((a, b) => (state.tiles[a].group || 0) - (state.tiles[b].group || 0));
    const body = (
      <div>
        {candidates.map(id => {
          const t = state.tiles[id];
          return (
            <div key={id} className="trade-item" onClick={() => { doBuild(id); closeModal(); }}>
              <div className="card-bar" style={{ background: t.color, width: 10, height: 24, borderRadius: 3 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.houses || 0} houses · ${t.houseCost} to build</div>
              </div>
            </div>
          );
        })}
      </div>
    );
    openModal(t(cfg.lang, 'build'), body, [{ label: t(cfg.lang, 'cancel'), style: 'secondary', fn: closeModal }]);
  }

  function openMortModal() {
    const candidates = p.properties.filter(id => {
      const t = state.tiles[id];
      return t.owner === p.id && !t.mortgaged && (t.houses || 0) === 0 && !!t.mortgage;
    }).sort((a, b) => (state.tiles[b].mortgage || 0) - (state.tiles[a].mortgage || 0));
    const body = (
      <div>
        {candidates.map(id => {
          const t = state.tiles[id];
          return (
            <div key={id} className="trade-item" onClick={() => { doMortgage(id); closeModal(); }}>
              <div className="card-bar" style={{ background: t.color || 'var(--muted)', width: 10, height: 24, borderRadius: 3 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Mortgage value: ${t.mortgage}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
    openModal(t(cfg.lang, 'mortgage'), body, [{ label: t(cfg.lang, 'cancel'), style: 'secondary', fn: closeModal }]);
  }

  function openUnmortModal() {
    const candidates = p.properties.filter(id => state.tiles[id].mortgaged && !!state.tiles[id].mortgage).sort((a, b) => (state.tiles[a].mortgage || 0) - (state.tiles[b].mortgage || 0));
    const body = (
      <div>
        {candidates.map(id => {
          const t = state.tiles[id];
          const cost = Math.ceil((t.mortgage || 0) * 1.1);
          return (
            <div key={id} className="trade-item" onClick={() => { doUnmortgage(id); closeModal(); }}>
              <div className="card-bar" style={{ background: t.color || 'var(--muted)', width: 10, height: 24, borderRadius: 3 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Cost: ${cost}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
    openModal(t(cfg.lang, 'unmortgage'), body, [{ label: t(cfg.lang, 'cancel'), style: 'secondary', fn: closeModal }]);
  }

  const currentActions: ActionDef[] = isHumanTurn ? (humanActions().length > 0 ? humanActions() : postActions()) : [];

  return (
    <div className="game-wrap">
      <div className="bg-grid" />
      <div className="scanlines" />

      <Sidebar state={state} cfg={cfg} />

      <section className="board-area">
        <div className="top-hud">
          <div className="turn-badge">
            <span className="dot" style={{ background: PLAYER_COLORS[p.id] || '#888' }} />
            <span>{p.isBot ? `${t(cfg.lang, 'botTurn')} — ${p.name}` : t(cfg.lang, 'yourTurn')}</span>
          </div>
          <div className="hud-center">
            <button className="hud-btn" onClick={togglePause}>❚❚</button>
          </div>
        </div>

        <GameBoard state={state} />

        <ActionBar dice={state.dice} animating={state.animating} actions={currentActions} />
      </section>

      <RightPanel state={state} cfg={cfg} />

      {state.paused && (
        <Modal
          title={t(cfg.lang, 'paused')}
          body={<div>Permainan dijeda.</div>}
          actions={[
            { label: t(cfg.lang, 'resume'), fn: () => { togglePause(); closeModal(); }, style: 'primary' },
            { label: t(cfg.lang, 'quit'), fn: () => router.push('/'), style: 'danger' },
          ]}
          onClose={togglePause}
        />
      )}

      {state.modal.open && !state.paused && (
        <Modal title={state.modal.title} body={state.modal.body} actions={state.modal.actions} onClose={closeModal} />
      )}

      {tradeModal && (
        <TradeModal state={state} cfg={cfg} onClose={() => setTradeModal(false)} doTrade={doTrade} addLog={addLog} />
      )}

      {showGameOver && (
        <Modal
          title={t(cfg.lang, 'gameOver')}
          body={
            <div style={{ textAlign: 'center', fontFamily: 'var(--pixel)', fontSize: 18, color: 'var(--accent1)' }}>
              {(() => {
                const alive = state.players.filter(pl => !pl.bankrupt);
                const winner = alive[0];
                return <>{winner ? winner.name : '???'} {t(cfg.lang, 'winner')}</>;
              })()}
            </div>
          }
          actions={[
            { label: t(cfg.lang, 'playAgain'), fn: () => { resetGame(); setShowGameOver(false); }, style: 'primary' },
            { label: t(cfg.lang, 'quit'), fn: () => router.push('/'), style: 'danger' },
          ]}
          onClose={() => setShowGameOver(false)}
        />
      )}
    </div>
  );
}
