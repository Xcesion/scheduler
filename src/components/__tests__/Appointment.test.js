import React from "react";
import { render } from "@testing-library/react";
import Application from "components/Application";
import axios from "axios";
import {
  getByText,
  fireEvent,
  prettyDOM,
  waitForElement,
  getAllByTestId,
  queryByText,
  getByAltText,
  getByPlaceholderText,
  queryByAltText
} from "@testing-library/react";

describe("Application", () => {
  it("renders without crashing", () => {
    const { getyByText } = render(<Application />);
  });

  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    const { container, debug } = render(<Application />);
    await waitForElement(() => getByText(container, "Archie Cohen"));
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
    fireEvent.click(getByAltText(appointment, "Add"));
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    fireEvent.click(getByText(appointment, "Save"));
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "no spots remaining")).toBeInTheDocument();
  });

  test.skip("does something else it is supposed to do", () => {
    // ...
  });
  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    const { container, debug } = render(<Application />);
    await waitForElement(() => getByText(container, "Archie Cohen"));
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Delete"));
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();
  
    fireEvent.click(queryByText(appointment, "Confirm"));
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();
    await waitForElement(() => getByAltText(appointment, "Add"));
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
    debug();
  });

  xit("loads data, edits an interview and keeps the spots remaining for Monday the same", async() => {
    const { container, getByText } = render( <Appointment/>);
    const editButton = getByText("Edit");
    fireEvent.click(editButton);

    const input = getByPlaceholderText("Enter Student Name");
    fireEvent.change(input, { target: { value: "Jane Smith" } });
    const saveButton = getByText("Save");
    fireEvent.click(saveButton);
    expect(getByText("Saving")).toBeInTheDocument();
    await waitForElementToBeRemoved(() => getByText("Saving"));

    expect(getByText("Jane Smith")).toBeInTheDocument();
    const mondaySpots = getByText("Monday");
    expect(mondaySpots).toBeInTheDocument();

  })

  it("shows the save error when failing to save an appointment", async() => {
    axios.put.mockRejectedValueOnce();

    const { container } = render(<Application />);

    await waitForElement(() => getByText(container, "Archie Cohen"));

    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
    
    fireEvent.click(queryByAltText(appointment, "Edit"));

    fireEvent.change(getByPlaceholderText(appointment, 'Enter Student Name'), {
      target: { value: 'Lydia Miller-Jones' }
    });

    fireEvent.click(queryByText(appointment, 'Save'));

    await waitForElement(() => getByText(appointment, "Could not book appointment."));
    fireEvent.click(getByAltText(appointment, "Close"));
  });

  it("shows the delete error when failing to delete an existing appointment", async() => {
    axios.delete.mockRejectedValueOnce();

    const { container,debug } = render(<Application />);

    await waitForElement(() => getByText(container, "Archie Cohen"));

    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Delete"));

    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    fireEvent.click(queryByText(appointment, "Confirm"));

    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    await waitForElement(() => getByText(appointment, "Could not cancel appointment."));

    fireEvent.click(getByAltText(appointment, "Close"));
  });
});
