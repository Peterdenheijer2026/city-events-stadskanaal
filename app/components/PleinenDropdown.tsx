"use client";

import { useState, useRef, useEffect } from "react";

const PLEINEN = [
  "BijFerdy",
  "Cafe de 2",
  "Fox",
  "Mamasthee",
  "'t Mingelmous",
] as const;

export default function PleinenDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="header__pleinen" ref={ref}>
      <button
        type="button"
        className="pleinen-btn"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
      >
        Pleinen
      </button>
      <div
        className={`pleinen-dropdown ${isOpen ? "is-open" : ""}`}
        role="menu"
      >
        {PLEINEN.map((name) => (
          <a key={name} href="#" role="menuitem">
            {name}
          </a>
        ))}
      </div>
    </div>
  );
}
