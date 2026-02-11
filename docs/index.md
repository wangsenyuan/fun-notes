---
layout: default
title: Fun Notes
---

<h1 class="page-title">{{ site.title }}</h1>
<p>{{ site.description }}</p>

<div class="notes-grid">
  {% assign sorted_notes = site.notes | sort: "date" | reverse %}
  {% for note in sorted_notes %}
  <a href="{{ note.url }}" class="note-card">
    <h2>{{ note.title }}</h2>
    <div class="meta">
      {{ note.date | date: "%b %d, %Y" }}
      {% if note.tags.size > 0 %}
      <span class="tags">{{ note.tags | join: ", " }}</span>
      {% endif %}
    </div>
  </a>
  {% endfor %}
</div>
