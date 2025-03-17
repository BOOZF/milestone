"use client";

import React, { useEffect, useState } from "react";
import {
  InputGroup,
  FormControl,
  Pagination,
  Dropdown,
  Button,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "font-awesome/css/font-awesome.min.css";
import { Event, PaginatedResponse, buttonsConfig, toTitleCase } from "@/types";

interface EventCardProps {
  data: Event;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}

// Event Card Component
function EventCard({ data, handleEdit, handleDelete }: EventCardProps) {
  return (
    <Card className="mb-4">
      <Card.Img
        variant="top"
        style={{ maxHeight: "250px", objectFit: "cover" }}
        src={data.files[0]}
      />
      <Card.Body>
        <span
          className="badge badge-pill badge-primary"
          style={{
            backgroundColor: buttonsConfig.find((btn) => btn.key === data?.key)
              ?.color,
          }}
        >
          {toTitleCase(data?.key)}
        </span>

        <Card.Title
          style={{
            padding: "0px",
            margin: "0px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            marginTop: "16px",
          }}
        >
          {data.title}
        </Card.Title>
        <Card.Text className="font-weight-bold pt-2">
          Year: {data?.year}
        </Card.Text>
        <div className="d-flex justify-content-between">
          <Button variant="primary" onClick={() => handleEdit(data._id)}>
            <i className="fa fa-solid fa-pencil"></i>
          </Button>
          <Button variant="danger" onClick={() => handleDelete(data._id)}>
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function EventsList() {
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [key, setKey] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  const keys = [
    "all",
    "our_journey",
    "highlights",
    "sustainability",
    "dark_days",
  ];

  const handleEventsFetch = async () => {
    try {
      const events = (await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/events-with-pagination?page=${page}&limit=${limit}&search=${search}&year=${year}&key=${
          key === "all" ? "" : key
        }`
      ).then((res) => res.json())) as PaginatedResponse;

      setEventsList(events.docs);
      setTotalPages(events.totalPages);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    handleEventsFetch();
  }, [search, page, key, year]);

  const handleEdit = (id: string) => {
    navigate(`/events/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        var requestOptions = {
          method: "DELETE",
          redirect: "follow" as RequestRedirect,
        };

        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${id}`,
          requestOptions
        )
          .then((response) => response.text())
          .then(() => {
            Swal.fire("Deleted!", "Event has been deleted.", "success");
            handleEventsFetch();
          })
          .catch((error) => console.log("error", error));
      }
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(e.target.value);
  };

  const handlePagination = (pageNum: number) => {
    setPage(pageNum);
  };

  const handleKeySelect = (selectedKey: string | null) => {
    if (selectedKey) {
      setKey(selectedKey);
    }
  };

  const selectedButton = buttonsConfig.find((btn) => btn.key === key);

  const handleAddFormNavigation = () => navigate("/events/add");
  const handleBackNavigation = () => navigate("/");

  return (
    <div
      style={{
        overflowY: "scroll",
        height: "100vh",
        padding: "24px",
      }}
    >
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ height: "60px", margin: "12px" }}
      >
        <Button size="sm" variant="dark" onClick={handleBackNavigation}>
          <i className="fas fa-arrow-left"></i> Back to site
        </Button>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            gap: 6,
            marginBottom: "20px",
          }}
        >
          <FormControl
            placeholder="Search for Event Year"
            aria-label="Search for Event Year"
            aria-describedby="basic-addon2"
            onChange={handleYear}
            style={{
              maxWidth: "200px",
            }}
          />
          <InputGroup style={{ marginBottom: "24px", margin: "auto" }}>
            <FormControl
              placeholder="Search for Event Title"
              aria-label="Search for Event Title"
              aria-describedby="basic-addon2"
              onChange={handleSearch}
            />
            <Dropdown onSelect={handleKeySelect}>
              <Dropdown.Toggle
                variant="success"
                id="dropdown-basic"
                style={{ backgroundColor: selectedButton?.color }}
              >
                {selectedButton?.label || "Select Key"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {keys.map((key, index) => (
                  <Dropdown.Item key={index} eventKey={key}>
                    {toTitleCase(key)}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </InputGroup>
        </div>

        <Button size="sm" variant="primary" onClick={handleAddFormNavigation}>
          {" "}
          <i className="fas fa-plus"></i> Add Event
        </Button>
      </div>

      <div className="container">
        <div className="row">
          {eventsList?.map((eventObj) => (
            <div key={eventObj._id} className="col-12 col-md-6 col-lg-4">
              <EventCard
                data={eventObj}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-center">
        <Pagination>
          {[...Array(totalPages).keys()].map((value) => (
            <Pagination.Item
              key={value + 1}
              active={value + 1 === page}
              onClick={() => handlePagination(value + 1)}
            >
              {value + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
}
