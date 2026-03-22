import { useState } from "react";
import { UnstyledButton, Text } from "@mantine/core";

interface MyButtonProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

export function MyButton({ icon, onClick, children }: MyButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        padding: "10px 12px",
        background: isHovered ? "#f0ebe0" : "transparent",
        border: `1px solid ${isHovered ? "#E8950C" : "#C2C2C2"}`,
        borderRadius: 6,
        color: isHovered ? "#111111" : "#6B6B6B",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "all 0.2s ease",
      }}
    >
      {icon && (
        <span style={{ 
          display: "flex", 
          alignItems: "center",
          color: isHovered ? "#E8950C" : "#6B6B6B",
        }}>
          {icon}
        </span>
      )}
      <Text size="sm" fw={500}>
        {children}
      </Text>
    </UnstyledButton>
  );
}