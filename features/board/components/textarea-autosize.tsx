import * as React from "react";

export interface TextareaAutosizeProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextareaAutosize = React.forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>(({ style, onChange, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const setRefs = (node: HTMLTextAreaElement) => {
    innerRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      // eslint-disable-next-line no-param-reassign
      (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
        node;
    }
  };

  const resize = () => {
    const element = innerRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  React.useEffect(() => {
    resize();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(event);
    }
    resize();
  };

  return (
    <textarea
      {...props}
      ref={setRefs}
      style={{
        ...style,
        overflow: "hidden",
        resize: "none"
      }}
      onChange={handleChange}
    />
  );
});

TextareaAutosize.displayName = "TextareaAutosize";

