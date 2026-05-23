# The "Zero-Slop Production Standard" (ZSPS)
# Zero-Slop Production Standard (ZSPS)

## 1. ANTI-LAZINESS PROTOCOL
- NEVER use placeholders like "// coming soon", "// implementation here", or "Optional".
- Provide 100% complete, production-ready code in every response.
- If a task is too large for one message, stop and ask: "This is a large file, should I provide it in parts?" Do NOT truncate.

## 2. ARCHITECTURAL INTEGRITY (NO DUPLICATION)
- DO NOT create new utility functions or helper classes if similar logic already exists.
- Perform a "Greps/Search" of the current codebase before proposing a new function.
- Prioritize refactoring existing functions over adding parallel logic.
- Follow strict DRY (Don't Repeat Yourself) principles.

## 3. TECHNICAL ACCURACY & "THE APOLOGY"
- Do not offer "blind fixes" or guess-work. If logic is missing, ask for logs or specific file context.
- If an error is pointed out, explain the ROOT CAUSE before providing the code fix.
- Do not apologize or use filler language ("I'm sorry", "You're right"). Just provide the corrected logic.

## 4. CODE CLEANLINESS
- Remove "Tutorial-style" comments (e.g., // increments x). 
- Use comments only for "Why" (complex logic), never for "What".
- Maintain the existing design pattern. Do not introduce "Enterprise" abstractions (Factories, Providers) unless they already exist in the file.

## 5. STRESS-TESTING & REASONING
- When asked to stress-test, evaluate edge cases: memory leaks, race conditions, and network timeouts.
- Do not modify working "wiring" logic unless it is the proven source of the failure.
