"use client";

import React, { useEffect, useState } from "react";
import {
  useForm,
  UseFormSetValue,
  UseFormGetValues,
  UseFormResetField,
} from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Swal from "sweetalert2";
import { Card, Button } from "react-bootstrap";
import "font-awesome/css/font-awesome.min.css";

type EventKey = "our_journey" | "highlights" | "sustainability" | "dark_days";

type EventFormData = {
  title: string;
  description: string;
  caption?: string;
  key: EventKey;
  year: number;
  files: string[];
  thumbnail?: string;
};

type EventPayload = {
  title: string;
  description: string;
  caption?: string;
  key: EventKey;
  year: number;
  files: string[];
  thumbnail: string;
};

// Helper function to convert form data to payload
const toEventPayload = (
  data: EventFormData,
  files: string[],
  thumbnail: string
): EventPayload => ({
  title: data.title,
  description: data.description,
  caption: data.caption,
  key: data.key,
  year: data.year,
  files,
  thumbnail: thumbnail || "",
});

interface FileInputProps {
  eventId?: string;
  setValue: UseFormSetValue<EventFormData>;
  files: string[];
  setFiles: React.Dispatch<React.SetStateAction<string[]>>;
  onSubmit: (data: EventFormData) => void;
  getValues: UseFormGetValues<EventFormData>;
  context: "create" | "edit";
  resetField: UseFormResetField<EventFormData>;
  thumbnail: string;
  setThumbnail: React.Dispatch<React.SetStateAction<string>>;
  updateEvent: (payload: EventPayload) => Promise<void>;
}

const FileInput: React.FC<FileInputProps> = ({
  files,
  setFiles,
  getValues,
  context,
  updateEvent,
}) => {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  const triggerFileInput = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  const addFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;

      const currentState = getValues();
      const file = event.target.files[0];
      const allowedFileTypes = [
        "image/jpeg",
        "image/png",
        "video/mp4",
        "application/pdf",
      ];

      if (!allowedFileTypes.includes(file.type)) {
        enqueueSnackbar("Please upload file in format: jpeg, png, mp4, pdf", {
          variant: "error",
        });
        if (fileInput.current) {
          fileInput.current.value = "";
        }
        return;
      }

      const formdata = new FormData();
      formdata.append("file", file, file.name);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/file/upload`,
        {
          method: "POST",
          body: formdata,
        }
      );

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const result = await response.json();
      const uploadedFile = result.fileUrl;
      const newFiles = [...files, uploadedFile];

      if (context !== "edit") {
        setFiles(newFiles);
      } else {
        const payload = toEventPayload(
          currentState,
          newFiles,
          currentState.thumbnail || ""
        );
        await updateEvent(payload);
      }

      if (fileInput.current) {
        fileInput.current.value = "";
      }
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : "An error occurred during file upload",
        {
          variant: "error",
        }
      );
    }
  };

  const removeFile = async (index: number) => {
    const currentState = getValues();
    const newFiles = files.filter((_, i) => i !== index);

    if (context !== "edit") {
      setFiles(newFiles);
    } else {
      const payload = toEventPayload(
        currentState,
        newFiles,
        currentState.thumbnail || ""
      );
      await updateEvent(payload);
    }
  };

  return (
    <div>
      <div className="file-input-group">
        <p>Enter links for your images.</p>
        <button type="button" className="add-button" onClick={triggerFileInput}>
          <i className="fas fa-plus"></i>
        </button>
        <input
          type="file"
          ref={fileInput}
          onChange={addFile}
          style={{ display: "none" }}
          accept=".jpeg,.jpg,.png,.mp4,.pdf"
        />
      </div>

      <div className="d-flex justify-content-between gap-2">
        {files.length === 0 ? (
          <p style={{ textAlign: "center" }}>No data</p>
        ) : (
          files.map((file, index) => (
            <Card
              key={index}
              className="mb-4"
              style={{
                width: "50%",
                border: "1px solid #ccc",
              }}
            >
              <Card.Img
                variant="top"
                style={{
                  height: "200px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                src={file}
                alt={`Uploaded file ${index + 1}`}
              />
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <Button variant="danger" onClick={() => removeFile(index)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

interface ThumbnailProps {
  thumbnailUrl: string;
}

function Thumbnail({ thumbnailUrl }: ThumbnailProps) {
  return (
    <Card
      className="mb-4"
      style={{
        width: "50%",
        border: "1px solid #ccc",
      }}
    >
      <Card.Img
        variant="top"
        style={{
          height: "200px",
          objectFit: "cover",
          objectPosition: "center",
        }}
        src={thumbnailUrl}
        alt="Thumbnail"
      />
    </Card>
  );
}

interface EventFormProps {
  context: "create" | "edit";
}

export default function EventForm({ context }: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    resetField,
  } = useForm<EventFormData>();

  const { eventId } = useParams<{ eventId: string }>();
  const [files, setFiles] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (context === "edit" && eventId) {
      fetchEvent();
    }
  }, [context, eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }

      const data = await response.json();
      const { title, description, caption, key, year, thumbnail, files } = data;

      setValue("title", title);
      setValue("description", description);
      setValue("caption", caption);
      setValue("key", key);
      setValue("year", year);
      setThumbnail(thumbnail);
      setValue("files", files);
      setFiles(files);
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : "Failed to fetch event details",
        {
          variant: "error",
        }
      );
      navigate("/events");
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (files.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter at least 1 image url!",
      });
      return;
    }

    const payload = toEventPayload(data, files, thumbnail);

    try {
      if (context === "edit" && eventId) {
        await updateEvent(payload);
      } else {
        await createEvent(payload);
      }
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Operation failed",
        {
          variant: "error",
        }
      );
    }
  };

  const updateEvent = async (payload: EventPayload): Promise<void> => {
    if (!eventId) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update event");
    }

    enqueueSnackbar("Successfully updated event!", {
      variant: "success",
    });

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const createEvent = async (payload: EventPayload): Promise<void> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create event");
    }

    enqueueSnackbar("Successfully created event!", {
      variant: "success",
    });

    setTimeout(() => {
      navigate(`/events`);
    }, 2500);
  };

  const handleBackNavigation = () => navigate("/events");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="main">
      <div
        className="d-flex justify-content-between"
        style={{ width: "100%", paddingBottom: "12px" }}
      >
        <Button
          size="sm"
          variant="dark"
          style={{ height: "40px" }}
          onClick={handleBackNavigation}
        >
          <i className="fas fa-arrow-left"></i> Back
        </Button>

        <h2>{context === "edit" ? "Edit Event" : "Add Event"}</h2>

        <span>&nbsp;</span>
      </div>

      <div className="field-group">
        <h1>Title</h1>
        <p>Title for your event.</p>
        <input
          className={`text-input ${errors.title ? "error-field" : ""}`}
          type="text"
          placeholder="Title"
          {...register("title", { required: true })}
        />
        {errors.title && <span className="error">This field is required</span>}
      </div>

      <div className="field-group">
        <h1>Description</h1>
        <p>Description for your event.</p>
        <textarea
          className={`textarea-input ${
            errors.description ? "error-field" : ""
          }`}
          placeholder="Description"
          {...register("description", { required: true })}
        />
        {errors.description && (
          <span className="error">This field is required</span>
        )}
      </div>

      <div className="field-group">
        <h1>
          Caption{" "}
          <span style={{ fontSize: "0.8em", color: "#888" }}>(Optional)</span>
        </h1>
        <p>Caption for your event.</p>
        <textarea
          className="textarea-input"
          placeholder="Caption"
          {...register("caption")}
        />
      </div>

      <div className="field-group">
        <h1>Category</h1>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              value="our_journey"
              {...register("key", { required: true })}
            />
            Our Journey
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="highlights"
              {...register("key", { required: true })}
            />
            Highlights
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="sustainability"
              {...register("key", { required: true })}
            />
            Sustainability
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="dark_days"
              {...register("key", { required: true })}
            />
            Dark Days
          </label>
        </div>
        {errors.key && <span className="error">Please select a category</span>}
      </div>

      <div className="field-group">
        <h1>Year</h1>
        <input
          className={`text-input ${errors.year ? "error-field" : ""}`}
          type="number"
          min="0"
          placeholder="Year"
          {...register("year", { required: true, valueAsNumber: true })}
        />
        {errors.year && <span className="error">This field is required</span>}
      </div>

      {thumbnail && (
        <div className="field-group">
          <h1>Thumbnail</h1>
          <p>Thumbnail for your event.</p>
          <Thumbnail thumbnailUrl={thumbnail} />
        </div>
      )}

      <div
        className="field-group"
        style={{
          border: "1px solid #ccc",
          padding: "12px",
          margin: "8px",
          borderRadius: "4px",
        }}
      >
        <h1>Images</h1>
        <FileInput
          eventId={eventId}
          setValue={setValue}
          files={files}
          setFiles={setFiles}
          onSubmit={onSubmit}
          getValues={getValues}
          context={context}
          resetField={resetField}
          thumbnail={thumbnail}
          setThumbnail={setThumbnail}
          updateEvent={updateEvent}
        />
        {errors.files && (
          <span className="error">Each file entry must not be empty</span>
        )}
      </div>

      <div className="submit-button">
        <input className="button" type="submit" value="Submit" />
      </div>
    </form>
  );
}
