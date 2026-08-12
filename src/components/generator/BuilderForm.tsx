"use client";

import { Dices, AtSign, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface BuilderFormProps {
  name: string;
  stack: string;
  title: string;
  handle: string;
  superpower: string;
  titleLocked: boolean;
  onName: (v: string) => void;
  onStack: (v: string) => void;
  onTitle: (v: string) => void;
  onHandle: (v: string) => void;
  onSuperpower: (v: string) => void;
  onTitleLock: () => void;
  onRegenerateTitle: () => void;
}

const inputCls =
  "w-full rounded-2xl border border-white/30 bg-white/[0.15] px-4 py-3.5 font-mono text-[13px] font-medium tracking-[0.08em] text-bone placeholder:text-dim outline-none transition-colors focus:border-electric/80 focus:bg-electric/[0.16]";

export function BuilderForm({
  name,
  stack,
  title,
  handle,
  superpower,
  titleLocked,
  onName,
  onStack,
  onTitle,
  onHandle,
  onSuperpower,
  onTitleLock,
  onRegenerateTitle,
}: BuilderFormProps) {
  return (
    <div className="rounded-3xl border border-white/30 bg-[#0e2418] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <p className="mb-4 font-mono text-[11px] font-bold tracking-[0.22em] text-electric">
        YOUR IDENTITY
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="id-name" className="mb-1.5 block font-mono text-[11px] font-bold tracking-[0.2em] text-mist">
            NAME
          </label>
          <input
            id="id-name"
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="SHRUTI RAI"
            maxLength={28}
            autoComplete="name"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="id-stack" className="mb-1.5 block font-mono text-[11px] font-bold tracking-[0.2em] text-mist">
            STACK / ROLE
          </label>
          <input
            id="id-stack"
            type="text"
            value={stack}
            onChange={(e) => onStack(e.target.value)}
            placeholder="FULL STACK DEVELOPER"
            maxLength={32}
            className={inputCls}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="id-title" className="font-mono text-[11px] font-bold tracking-[0.2em] text-mist">
              BUILDER TITLE
            </label>
            <button
              onClick={onRegenerateTitle}
              className="inline-flex items-center gap-1.5 rounded-full border border-electric/50 bg-electric/15 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.14em] text-electric transition-colors hover:border-electric hover:bg-electric/25"
            >
              <Dices size={12} /> GENERATE TITLE
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={title + (titleLocked ? "-locked" : "")}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <input
                id="id-title"
                type="text"
                value={title}
                onChange={(e) => {
                  onTitle(e.target.value.toUpperCase());
                  onTitleLock();
                }}
                placeholder="THE BUILDER"
                maxLength={26}
                className={inputCls}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="id-handle" className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.2em] text-mist">
              <AtSign size={11} /> X HANDLE <span className="text-dim">· OPTIONAL</span>
            </label>
            <input
              id="id-handle"
              type="text"
              value={handle}
              onChange={(e) => onHandle(e.target.value)}
              placeholder="@you"
              maxLength={20}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="id-power" className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.2em] text-mist">
              <Wrench size={11} /> SUPERPOWER <span className="text-dim">· OPTIONAL</span>
            </label>
            <input
              id="id-power"
              type="text"
              value={superpower}
              onChange={(e) => onSuperpower(e.target.value)}
              placeholder="SHIPS BEFORE SUNRISE"
              maxLength={30}
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
