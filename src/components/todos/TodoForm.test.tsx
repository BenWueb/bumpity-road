import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "./TodoForm";

describe("TodoForm", () => {
  it("submits trimmed title and null details when empty", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <TodoForm
        onSubmit={onSubmit}
        onCancel={() => {}}
        showStatusField
        initialData={{}}
      />
    );

    await user.type(
      screen.getByPlaceholderText("Task title..."),
      "   Hello world   "
    );
    await user.type(
      screen.getByPlaceholderText("Details (optional)..."),
      "    "
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Hello world",
      details: null,
      recurring: null,
      status: "todo",
      assignedToId: null,
    });
  });

  it("coerces invalid status back to todo", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <TodoForm
        onSubmit={onSubmit}
        onCancel={() => {}}
        showStatusField
        initialData={{}}
      />
    );

    await user.type(screen.getByPlaceholderText("Task title..."), "Test");

    // Force an invalid value onto the select; the onChange path should coerce.
    const statusSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(statusSelect, { target: { value: "weird_status" } });

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ status: "todo" })
    );
  });
});


