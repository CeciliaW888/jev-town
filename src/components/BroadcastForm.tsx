import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { MAX_BROADCAST_LENGTH } from "@shared/protocol.ts";
import { PRESETS } from "../presets.ts";

export interface BroadcastFormProps {
  disabled: boolean;
  onSubmit: (broadcast: string) => void;
}

export function BroadcastForm({ disabled, onSubmit }: BroadcastFormProps) {
  const [text, setText] = useState("");
  const textareaId = useId();
  const counterId = useId();

  const trimmed = text.trim();
  const tooLong = trimmed.length > MAX_BROADCAST_LENGTH;
  const canSubmit = trimmed.length > 0 && !tooLong && !disabled;

  function submit(value: string) {
    const clean = value.trim();
    if (!clean || clean.length > MAX_BROADCAST_LENGTH || disabled) return;
    onSubmit(clean);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(text);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      submit(text);
    }
  }

  return (
    <form className="broadcast-form" onSubmit={handleSubmit}>
      <label htmlFor={textareaId} className="broadcast-form__label">
        Broadcast to the whole town
      </label>
      <textarea
        id={textareaId}
        className="broadcast-form__textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Everyone who doesn't go to the fountain will be bitten by a poisonous snake."
        maxLength={MAX_BROADCAST_LENGTH * 2}
        rows={3}
        disabled={disabled}
        aria-describedby={counterId}
      />
      <div className="broadcast-form__row">
        <span id={counterId} className={`broadcast-form__counter${tooLong ? " broadcast-form__counter--over" : ""}`}>
          {trimmed.length} / {MAX_BROADCAST_LENGTH}
        </span>
        <button type="submit" className="button button--primary" disabled={!canSubmit}>
          {disabled ? "Broadcasting…" : "Broadcast"}
        </button>
      </div>

      <div className="broadcast-form__presets" role="group" aria-label="Preset broadcasts">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="chip"
            disabled={disabled}
            onClick={() => {
              setText(preset.text);
            }}
            title={preset.text}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </form>
  );
}
