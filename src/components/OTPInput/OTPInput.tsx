import React, {
  useImperativeHandle,
  useRef,
  useEffect,
  Ref,
} from "react";
import styles from "./OTPInput.module.css";

export interface OTPInputHandle {
  focusIndex: (_index: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
  clear: () => void;
}

export interface OTPInputProps {
  ref?: Ref<OTPInputHandle>;
  length?: number;
  value: string;
  onChange: (_value: string) => void;
  onComplete?: (_value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
  className?: string;
}

// Derive per-slot digits from the value string.
// Spaces are treated as empty placeholders to preserve slot positions
// when digits are deleted from the middle.
function deriveDigits(value: string, length: number): string[] {
  return Array.from({ length }, (_, i) => {
    const ch = value[i];
    return ch && ch !== " " ? ch : "";
  });
}

// Join digits back into a positional string, using spaces for empty
// slots so that occupied positions are preserved.
function joinDigits(digits: string[]): string {
  const joined = digits.map((d) => d || " ").join("");
  // Trim trailing spaces so a fully/partially cleared OTP doesn't carry
  // invisible padding (e.g. "12    " → "12")
  return joined.trimEnd();
}

// Check whether every slot contains exactly one digit.
function isComplete(digits: string[], length: number): boolean {
  return (
    digits.length === length && digits.every((d) => /^\d$/.test(d))
  );
}

export default function OTPInput({
  ref,
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = false,
  className = "",
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = deriveDigits(value, length);

  useImperativeHandle(ref, () => ({
    focusIndex: (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, length - 1));
      const target = inputRefs.current[clampedIndex];
      if (target) {
        target.focus();
        target.select();
      }
    },
    focusFirst: () => {
      const target = inputRefs.current[0];
      if (target) {
        target.focus();
        target.select();
      }
    },
    focusLast: () => {
      const target = inputRefs.current[length - 1];
      if (target) {
        target.focus();
        target.select();
      }
    },
    clear: () => {
      onChange("");
      inputRefs.current[0]?.focus();
    },
  }));

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  // Debounce onComplete so that rapidly editing the last digit doesn't
  // fire multiple API calls. Each call cancels the previous pending timer,
  // so only the final value triggers the callback after 300ms of inactivity.
  const triggerOnComplete = (newValue: string) => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
    }
    completeTimerRef.current = setTimeout(() => {
      onComplete?.(newValue);
      completeTimerRef.current = null;
    }, 300);
  };

  const updateDigit = (
    index: number,
    newDigit: string,
    moveToNext = true,
  ) => {
    const newDigits = [...digits];
    newDigits[index] = newDigit;
    const newValue = joinDigits(newDigits);
    onChange(newValue);

    if (moveToNext && newDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (isComplete(newDigits, length)) {
      triggerOnComplete(newValue);
    }
  };

  // Fill multiple slots starting at startIdx. Used by handleChange,
  // handlePaste, and handleInput to avoid repeating the same logic.
  const fillFromIndex = (startIdx: number, chars: string) => {
    const newDigits = [...digits];

    for (let i = 0; i < chars.length && startIdx + i < length; i++) {
      newDigits[startIdx + i] = chars[i];
    }

    const newValue = joinDigits(newDigits);
    onChange(newValue);

    const nextIndex = Math.min(startIdx + chars.length, length - 1);
    const nextInput = inputRefs.current[nextIndex];
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }

    if (isComplete(newDigits, length)) {
      triggerOnComplete(newValue);
    }
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const sanitized = e.target.value.replace(/\D/g, "");

    // 1. User cleared the box
    if (!sanitized) {
      updateDigit(index, "", false);
      return;
    }

    // 2. Multi-character insertion (e.g., browser autofill or password manager)
    if (sanitized.length > 1) {
      fillFromIndex(index, sanitized);
      return;
    }

    updateDigit(index, sanitized, true);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const prevIndex = index - 1;
        const newDigits = [...digits];
        newDigits[prevIndex] = "";
        onChange(joinDigits(newDigits));
        const prevInput = inputRefs.current[prevIndex];
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();

    // Clip to the number of remaining slots from the focused input
    const remainingSlots = length - index;
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, remainingSlots);

    if (!pastedData) return;

    fillFromIndex(index, pastedData);
  };

  // Catches browser autofill / password managers that bypass maxLength.
  // The native InputEvent carries the full inserted string in `data`,
  // before the browser truncates the input's value to maxLength.
  const handleInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent;

    // Only handle autofill-style insertions, not regular typing
    if (
      nativeEvent.inputType !== "insertReplacementText" &&
      nativeEvent.inputType !== "insertFromPaste"
    ) {
      return;
    }

    const data = nativeEvent.data;
    if (!data || data.length <= 1) return;

    const sanitized = data.replace(/\D/g, "");
    if (sanitized.length <= 1) return;

    // Prevent the onChange from also firing with the truncated value
    e.preventDefault();

    fillFromIndex(index, sanitized);
  };

  return (
    <div className={`${styles.otpContainer} ${className}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={`${styles.otpInput} ${hasError ? styles.hasError : ""}`}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onInput={(e) => handleInput(index, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
