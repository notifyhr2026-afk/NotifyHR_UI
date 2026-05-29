import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Badge,
  Image,
  Modal,
  Dropdown,
} from "react-bootstrap";


interface Comment {
  id: number;
  employee: string;
  text: string;
  time: string;
}

interface Reaction {
  type: string;
  count: number;
}

interface Post {
  id: number;
  employee: string;
  designation: string;
  profileImage: string;
  type: "BIRTHDAY" | "ANNOUNCEMENT" | "RECOGNITION" | "GENERAL";
  content: string;
  image?: string;
  time: string;
  isOwnPost?: boolean;
  reactions: Reaction[];
  comments: Comment[];
}

/* SAMPLE DATA */
const initialPosts: Post[] = [
  {
    id: 1,
    employee: "Sarah Johnson",
    designation: "HR Manager",
    profileImage: "https://i.pravatar.cc/100?img=11",
    type: "BIRTHDAY",
    content:
      "🎂 Today is John Doe's birthday! Wish him a fantastic year ahead!",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3",
    time: "2 hours ago",
    isOwnPost: false,
    reactions: [
      { type: "👍", count: 12 },
      { type: "🎉", count: 8 },
    ],
    comments: [
      {
        id: 1,
        employee: "Michael",
        text: "Happy Birthday 🎂",
        time: "1 hour ago",
      },
    ],
  },

  {
    id: 2,
    employee: "Current User",
    designation: "Software Engineer",
    profileImage: "https://i.pravatar.cc/100?img=5",
    type: "RECOGNITION",
    content:
      "🌟 Proud to announce successful deployment completion by our engineering team.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    time: "30 mins ago",
    isOwnPost: true,
    reactions: [{ type: "👏", count: 5 }],
    comments: [],
  },
];

const EmployeeConnect: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const [showModal, setShowModal] = useState(false);

  const [editingPostId, setEditingPostId] =
    useState<number | null>(null);

  const [postType, setPostType] =
    useState<Post["type"]>("GENERAL");

  const [content, setContent] = useState("");

  const [imagePreview, setImagePreview] = useState<
    string | undefined
  >();

  const [commentInputs, setCommentInputs] = useState<{
    [key: number]: string;
  }>({});

  /* OPEN CREATE MODAL */
  const handleOpenCreate = () => {
    setEditingPostId(null);
    setPostType("GENERAL");
    setContent("");
    setImagePreview(undefined);
    setShowModal(true);
  };

  /* IMAGE UPLOAD */
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);

    setImagePreview(preview);
  };

  /* SAVE POST */
  const handleSavePost = () => {
    if (!content.trim()) return;

    if (editingPostId) {
      /* EDIT POST */
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingPostId
            ? {
                ...post,
                content,
                type: postType,
                image: imagePreview,
              }
            : post
        )
      );
    } else {
      /* CREATE POST */
      const newPost: Post = {
        id: posts.length + 1,
        employee: "Current User",
        designation: "Software Engineer",
        profileImage:
          "https://i.pravatar.cc/100?img=5",
        type: postType,
        content,
        image: imagePreview,
        time: "Just now",
        isOwnPost: true,
        reactions: [],
        comments: [],
      };

      setPosts([newPost, ...posts]);
    }

    setShowModal(false);
  };

  /* EDIT POST */
  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setPostType(post.type);
    setContent(post.content);
    setImagePreview(post.image);
    setShowModal(true);
  };

  /* DELETE POST */
  const handleDeletePost = (postId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) return;

    setPosts((prev) =>
      prev.filter((post) => post.id !== postId)
    );
  };

  /* REACTIONS */
  const handleReaction = (
    postId: number,
    reactionType: string
  ) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const existing = post.reactions.find(
          (r) => r.type === reactionType
        );

        if (existing) {
          return {
            ...post,
            reactions: post.reactions.map((r) =>
              r.type === reactionType
                ? {
                    ...r,
                    count: r.count + 1,
                  }
                : r
            ),
          };
        }

        return {
          ...post,
          reactions: [
            ...post.reactions,
            {
              type: reactionType,
              count: 1,
            },
          ],
        };
      })
    );
  };

  /* ADD COMMENT */
  const handleAddComment = (postId: number) => {
    const text = commentInputs[postId];

    if (!text?.trim()) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: post.comments.length + 1,
              employee: "Current User",
              text,
              time: "Just now",
            },
          ],
        };
      })
    );

    setCommentInputs({
      ...commentInputs,
      [postId]: "",
    });
  };

  return (
    <div className="container-fluid">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="mb-1">
                Employee Connect
              </h3>

              <p className="text-muted mb-0">
                Share celebrations, announcements,
                achievements & updates
              </p>
            </div>

            <Button onClick={handleOpenCreate}>
              + Create Post
            </Button>
          </div>

          {/* POSTS */}
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-0 shadow-sm rounded-4 mb-4"
            >
              <Card.Body>
                {/* HEADER */}
                <div className="d-flex align-items-start">
                  <Image
                    src={post.profileImage}
                    roundedCircle
                    width={55}
                    height={55}
                  />

                  <div className="ms-3 flex-grow-1">
                    <h6 className="mb-0">
                      {post.employee}
                    </h6>

                    <small className="text-muted">
                      {post.designation}
                    </small>

                    <div>
                      <small className="text-muted">
                        {post.time}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Badge
                      bg={
                        post.type === "BIRTHDAY"
                          ? "warning"
                          : post.type ===
                            "RECOGNITION"
                          ? "success"
                          : post.type ===
                            "ANNOUNCEMENT"
                          ? "primary"
                          : "secondary"
                      }
                    >
                      {post.type}
                    </Badge>

                    {/* OWN POST OPTIONS */}
                    {post.isOwnPost && (
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                        >
                          ⋮
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              handleEditPost(post)
                            }
                          >
                            Edit Post
                          </Dropdown.Item>

                          <Dropdown.Item
                            className="text-danger"
                            onClick={() =>
                              handleDeletePost(
                                post.id
                              )
                            }
                          >
                            Delete Post
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="mt-3">
                  <p className="mb-3 fs-6">
                    {post.content}
                  </p>

                  {/* IMAGE */}
                  {post.image && (
                    <img
                      src={post.image}
                      alt="post"
                      className="img-fluid rounded-4 mb-3"
                      style={{
                        width: "100%",
                        maxHeight: "420px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>

                {/* REACTION COUNTS */}
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {post.reactions.map(
                    (reaction, index) => (
                      <Badge
                        key={index}
                        bg="light"
                        text="dark"
                        className="px-3 py-2"
                      >
                        {reaction.type}{" "}
                        {reaction.count}
                      </Badge>
                    )
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="d-flex gap-2 flex-wrap mb-4">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() =>
                      handleReaction(
                        post.id,
                        "👍"
                      )
                    }
                  >
                    👍 Like
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() =>
                      handleReaction(
                        post.id,
                        "❤️"
                      )
                    }
                  >
                    ❤️ Love
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() =>
                      handleReaction(
                        post.id,
                        "🎉"
                      )
                    }
                  >
                    🎉 Celebrate
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-warning"
                    onClick={() =>
                      handleReaction(
                        post.id,
                        "👏"
                      )
                    }
                  >
                    👏 Applause
                  </Button>
                </div>

                {/* COMMENTS */}
                <div className="border-top pt-3">
                  <h6 className="mb-3">
                    Comments (
                    {post.comments.length})
                  </h6>

                  {/* COMMENT LIST */}
                  {post.comments.map(
                    (comment) => (
                      <div
                        key={comment.id}
                        className="bg-light rounded-3 p-3 mb-2"
                      >
                        <div className="fw-semibold">
                          {comment.employee}
                        </div>

                        <div>{comment.text}</div>

                        <small className="text-muted">
                          {comment.time}
                        </small>
                      </div>
                    )
                  )}

                  {/* ADD COMMENT */}
                  <div className="d-flex gap-2 mt-3">
                    <Form.Control
                      placeholder="Write a comment..."
                      value={
                        commentInputs[
                          post.id
                        ] || ""
                      }
                      onChange={(e) =>
                        setCommentInputs({
                          ...commentInputs,
                          [post.id]:
                            e.target.value,
                        })
                      }
                    />

                    <Button
                      onClick={() =>
                        handleAddComment(
                          post.id
                        )
                      }
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>

      {/* CREATE / EDIT POST MODAL */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPostId
              ? "Edit Post"
              : "Create Post"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* POST TYPE */}
          <Form.Group className="mb-3">
            <Form.Label>Post Type</Form.Label>

            <Form.Select
              value={postType}
              onChange={(e) =>
                setPostType(
                  e.target.value as Post["type"]
                )
              }
            >
              <option value="GENERAL">
                General
              </option>

              <option value="ANNOUNCEMENT">
                Announcement
              </option>

              <option value="BIRTHDAY">
                Birthday
              </option>

              <option value="RECOGNITION">
                Recognition
              </option>
            </Form.Select>
          </Form.Group>

          {/* CONTENT */}
          <Form.Group className="mb-3">
            <Form.Label>Content</Form.Label>

            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Share your update..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
            />
          </Form.Group>

          {/* IMAGE */}
          <Form.Group className="mb-3">
            <Form.Label>
              Upload Image
            </Form.Label>

            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Form.Group>

          {/* IMAGE PREVIEW */}
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="img-fluid rounded-4"
              style={{
                width: "100%",
                maxHeight: "350px",
                objectFit: "cover",
              }}
            />
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setShowModal(false)
            }
          >
            Cancel
          </Button>

          <Button onClick={handleSavePost}>
            {editingPostId
              ? "Update Post"
              : "Create Post"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeConnect;
