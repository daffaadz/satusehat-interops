"use client";

export function Skeleton({ className = '', style, ...props }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

export default Skeleton;
