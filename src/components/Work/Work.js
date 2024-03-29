import React from "react";
import "./Work.scss";
import Project from "../Project/Project";
import projects from "../../copy/projects.json";

export default function Work() {
  return (
    <div id="Work">
      <h3 id="workTop">Projects & Research</h3>
      {projects.map((p) => (
        <Project
          key={p.title}
          title={p.title}
          img={p.img}
          img2={p.img2}
          link={p.link}
          body={p.body}
        />
      ))}
    </div>
  );
}
