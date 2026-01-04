import React, { useState } from "react";
import { Form } from "react-bootstrap";

const skillOptions = ["React", "Angular", "Node.js", "Java", "Python"];

const CandidateSkills: React.FC = () => {
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSearch("");
  };

  return (
    <>
      <Form.Control
        placeholder="Search skill"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search && (
        <div className="border mt-1 bg-white">
          {skillOptions
            .filter(
              (s) =>
                s.toLowerCase().includes(search.toLowerCase()) &&
                !skills.includes(s)
            )
            .map((s) => (
              <div
                key={s}
                className="p-2 dropdown-item"
                onClick={() => addSkill(s)}
              >
                {s}
              </div>
            ))}
        </div>
      )}

      <Form.Control
        as="textarea"
        rows={3}
        className="mt-3"
        value={skills.join(", ")}
        readOnly
      />
    </>
  );
};

export default CandidateSkills;
