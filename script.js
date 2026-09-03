fetch("projects.json")
  .then((res) => res.json())
  .then((projects) => {
    const list = document.getElementById("projects");

    if (!projects.length) {
      list.innerHTML = '<li class="empty">Aucun projet pour le moment.</li>';
      return;
    }

    for (const project of projects) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = project.url;

      const icon = document.createElement("img");
      icon.className = "icon";
      icon.alt = "";
      icon.src = `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(project.url)}`;

      const text = document.createElement("span");
      text.className = "text";

      const name = document.createElement("span");
      name.className = "name";
      name.textContent = project.name;
      text.appendChild(name);

      if (project.desc) {
        const desc = document.createElement("span");
        desc.className = "desc";
        desc.textContent = project.desc;
        text.appendChild(desc);
      }

      a.appendChild(icon);
      a.appendChild(text);
      li.appendChild(a);
      list.appendChild(li);
    }
  });
