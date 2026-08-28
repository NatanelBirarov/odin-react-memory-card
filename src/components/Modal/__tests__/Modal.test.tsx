import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Modal, { ModalText, ModalBlockRow, ModalBlockColumn } from "../Modal";

describe("Modal", () => {
  it("renders children content", () => {
    render(
      <Modal>
        <p>Test content</p>
      </Modal>,
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders with default contentType", () => {
    const { container } = render(
      <Modal>
        <p>Default</p>
      </Modal>,
    );
    // The outer div should have the modal class.
    const modalDiv = container.firstChild as HTMLElement;
    expect(modalDiv).toBeInTheDocument();
  });
});

describe("ModalText", () => {
  it("renders children content", () => {
    render(
      <ModalText>
        <p>Text content</p>
      </ModalText>,
    );
    expect(screen.getByText("Text content")).toBeInTheDocument();
  });
});

describe("ModalBlockRow", () => {
  it("renders children content", () => {
    render(
      <ModalBlockRow>
        <button>Action</button>
      </ModalBlockRow>,
    );
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});

describe("ModalBlockColumn", () => {
  it("renders children content", () => {
    render(
      <ModalBlockColumn>
        <span>Column item</span>
      </ModalBlockColumn>,
    );
    expect(screen.getByText("Column item")).toBeInTheDocument();
  });
});
