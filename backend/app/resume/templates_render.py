def render_template(resume_data: dict, template_id: str = "minimalist") -> str:
    """
    Renders resume data into HTML format based on selected template.
    """
    personal = resume_data.get("personal_details", {})
    education = resume_data.get("education", [])
    experience = resume_data.get("experience", [])
    projects = resume_data.get("projects", [])
    skills = resume_data.get("skills", [])
    achievements = resume_data.get("achievements", [])
    certificates = resume_data.get("certificates", [])

    # Common head metadata and CSS styling
    head = """
    <head>
        <meta charset="utf-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
            @page {
                size: letter;
                margin: 0.4in;
            }
            body {
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 0;
                color: #1f2937;
                background-color: #ffffff;
                line-height: 1.35;
                font-size: 9.5pt;
            }
            .section-title {
                font-size: 10.5pt;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-top: 12px;
                margin-bottom: 6px;
                border-bottom: 1.5px solid #e5e7eb;
                padding-bottom: 3px;
                color: #111827;
                display: flex;
                align-items: center;
            }
            .section-icon {
                width: 14px;
                height: 14px;
                display: inline-block;
                vertical-align: middle;
                margin-right: 6px;
                color: #000000;
            }
            .entry {
                margin-bottom: 8px;
            }
            .entry-header {
                display: flex;
                justify-content: space-between;
                font-weight: 600;
                font-size: 10.5pt;
                color: #111827;
            }
            .entry-subheader {
                display: flex;
                justify-content: space-between;
                font-size: 9.5pt;
                font-weight: 500;
                color: #4b5563;
                margin-top: 2px;
            }
            .entry-description {
                font-size: 9pt;
                color: #374151;
                margin-top: 4px;
                white-space: pre-line;
            }
            .skills-list {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 5px;
            }
            .skill-tag {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                padding: 2px 8px;
                font-size: 8.5pt;
                font-weight: 500;
                color: #374151;
            }
        </style>
    </head>
    """

    if template_id == "modern":
        # Two Column Modern Layout
        # Left side: Contacts, Skills, Education, Certificates
        # Right side: Summary/Bio, Work History, Projects, Milestones
        left_column = f"""
        <div style="width: 32%; padding-right: 15px; border-right: 1px solid #e5e7eb;">
            <div style="font-size: 9pt; color: #4b5563; line-height: 1.4; margin-bottom: 12px;">
                {f"<div>✉️ {personal.get('email', '')}</div>" if personal.get('email') else ""}
                {f"<div>📞 {personal.get('phone', '')}</div>" if personal.get('phone') else ""}
                {f"<div>📍 {personal.get('location', '')}</div>" if personal.get('location') else ""}
                {f"<div>🌐 <a href='{personal.get('website', '')}' style='color:#1f2937; text-decoration:none;'>{personal.get('website', '')}</a></div>" if personal.get('website') else ""}
                {f"<div>💻 <a href='{personal.get('github', '')}' style='color:#1f2937; text-decoration:none;'>GitHub</a></div>" if personal.get('github') else ""}
                {f"<div>👔 <a href='{personal.get('linkedin', '')}' style='color:#1f2937; text-decoration:none;'>LinkedIn</a></div>" if personal.get('linkedin') else ""}
            </div>
        """
        if skills:
            skills_html = " ".join(f'<span class="skill-tag">{s}</span>' for s in skills)
            left_column += f"""
            <div class="section-title">Skills</div>
            <div class="skills-list">
                {skills_html}
            </div>
            """
        if education:
            left_column += '<div class="section-title">Education</div>'
            for edu in education:
                left_column += f"""
                <div class="entry" style="margin-bottom: 8px;">
                    <div style="font-weight: 600; font-size: 9pt; color: #111827;">{edu.get('degree')}</div>
                    <div style="font-size: 8.5pt; color: #4b5563;">{edu.get('field_of_study')}</div>
                    <div style="font-size: 8.5pt; font-style: italic; color: #6b7280; margin-top:1px;">{edu.get('institution')}</div>
                    <div style="font-size: 8pt; color: #9ca3af; margin-top:1px;">{edu.get('start_date')} - {edu.get('end_date') or 'Present'}</div>
                </div>
                """
        if certificates:
            left_column += '<div class="section-title">Certificates</div>'
            for cert in certificates:
                left_column += f"""
                <div class="entry" style="margin-bottom: 8px;">
                    <div style="font-weight: 600; font-size: 9pt; color: #111827;">{cert.get('name')}</div>
                    <div style="font-size: 8.5pt; color: #4b5563;">{cert.get('issuer')}</div>
                    <div style="font-size: 8pt; color: #9ca3af;">{cert.get('date')}</div>
                </div>
                """
        left_column += "</div>"

        right_column = """<div style="width: 65%; padding-left: 15px;">"""
        if personal.get("bio"):
            right_column += f"""
            <div class="section-title" style="margin-top:0;">Professional Bio</div>
            <p style="font-size: 9pt; color: #374151; margin-top:4px; margin-bottom:12px; white-space: pre-line;">{personal.get('bio')}</p>
            """
        if experience:
            right_column += '<div class="section-title">Work History</div>'
            for exp in experience:
                right_column += f"""
                <div class="entry">
                    <div class="entry-header">
                        <span>{exp.get('position')}</span>
                        <span style="font-size: 8.5pt; font-weight: normal; color: #6b7280;">{exp.get('start_date')} - {exp.get('end_date') or 'Present'}</span>
                    </div>
                    <div class="entry-subheader">
                        <span style="color: #000000; font-weight: 600;">{exp.get('company')}</span>
                    </div>
                    {f'<div class="entry-description">{exp.get("description")}</div>' if exp.get("description") else ""}
                </div>
                """
        if projects:
            right_column += '<div class="section-title">Projects</div>'
            for proj in projects:
                right_column += f"""
                <div class="entry">
                    <div class="entry-header">
                        <span>{proj.get('title')} <span style="font-size:8.5pt; font-weight:normal; color:#6b7280;">({proj.get('role')})</span></span>
                        {f'<span style="font-size:8pt; font-weight:normal;"><a href="{proj.get("url")}" style="color:#000000; text-decoration:underline;">Link</a></span>' if proj.get("url") else ""}
                    </div>
                    {f'<div class="entry-description">{proj.get("description")}</div>' if proj.get("description") else ""}
                </div>
                """
        if achievements:
            right_column += '<div class="section-title">Milestones</div>'
            for ach in achievements:
                right_column += f"""
                <div class="entry" style="margin-bottom:8px;">
                    <div style="font-weight: 600; font-size: 9pt; color:#111827;">{ach.get('title')}</div>
                    <div style="font-size: 8.5pt; color:#4b5563; margin-top:2px;">{ach.get('description')}</div>
                </div>
                """
        right_column += "</div>"

        html_body = f"""
        <body>
            <div style="padding: 20px;">
                <div style="border-bottom: 2px solid #111827; padding-bottom: 15px; margin-bottom: 20px; text-align: left;">
                    <h1 style="font-size: 22pt; margin: 0; color: #111827; font-weight: 800;">{personal.get('name', 'Candidate Name')}</h1>
                    <p style="font-size: 11pt; font-weight: 600; color: #4b5563; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em;">{resume_data.get('title', '')}</p>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    {left_column}
                    {right_column}
                </div>
            </div>
        </body>
        """

    elif template_id == "classic":
        # Classic Executive (Centered, elegant serif fonts, traditional)
        classic_style = """
        <style>
            @page {
                size: letter;
                margin: 0.4in;
            }
            .classic-title {
                font-family: 'Playfair Display', serif;
                font-size: 20pt;
                font-weight: 700;
                text-align: center;
                margin: 0;
                color: #0f172a;
            }
            .classic-subtitle {
                font-family: 'Inter', sans-serif;
                font-size: 9pt;
                font-weight: 600;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                color: #475569;
                margin-top: 4px;
                margin-bottom: 8px;
            }
            .classic-contact {
                text-align: center;
                font-size: 8pt;
                color: #475569;
                margin-bottom: 12px;
                border-bottom: 1px double #94a3b8;
                padding-bottom: 6px;
            }
            .classic-section-title {
                font-family: 'Playfair Display', serif;
                font-size: 10.5pt;
                font-weight: 700;
                letter-spacing: 0.02em;
                margin-top: 12px;
                margin-bottom: 6px;
                border-bottom: 1px solid #cbd5e1;
                padding-bottom: 2px;
                color: #0f172a;
                text-transform: uppercase;
            }
        </style>
        """
        
        contacts = []
        if personal.get("email"): contacts.append(personal.get("email"))
        if personal.get("phone"): contacts.append(personal.get("phone"))
        if personal.get("location"): contacts.append(personal.get("location"))
        if personal.get("website"): contacts.append(f'<a href="{personal.get("website")}" style="color:#475569; text-decoration:none;">Website</a>')
        if personal.get("github"): contacts.append(f'<a href="{personal.get("github")}" style="color:#475569; text-decoration:none;">GitHub</a>')
        if personal.get("linkedin"): contacts.append(f'<a href="{personal.get("linkedin")}" style="color:#475569; text-decoration:none;">LinkedIn</a>')
        
        contacts_str = " &nbsp;|&nbsp; ".join(contacts)

        body_content = ""
        if personal.get("bio"):
            body_content += f"""
            <div class="classic-section-title">Summary</div>
            <p style="font-size: 9pt; color: #334155; margin-top:4px; line-height: 1.6; text-align: justify; white-space: pre-line;">{personal.get('bio')}</p>
            """
        
        if experience:
            body_content += '<div class="classic-section-title">Professional Experience</div>'
            for exp in experience:
                body_content += f"""
                <div class="entry">
                    <div class="entry-header">
                        <span>{exp.get('position')}</span>
                        <span style="font-size: 8.5pt; font-weight: normal; color: #475569;">{exp.get('start_date')} - {exp.get('end_date') or 'Present'}</span>
                    </div>
                    <div class="entry-subheader">
                        <span style="font-style: italic; font-weight: 600;">{exp.get('company')}</span>
                    </div>
                    {f'<div class="entry-description" style="line-height:1.5; text-align:justify;">{exp.get("description")}</div>' if exp.get("description") else ""}
                </div>
                """

        if projects:
            body_content += '<div class="classic-section-title">Selected Projects</div>'
            for proj in projects:
                body_content += f"""
                <div class="entry">
                    <div class="entry-header">
                        <span>{proj.get('title')} <span style="font-size:8.5pt; font-weight:normal; font-style:italic; color:#475569;">({proj.get('role')})</span></span>
                        {f'<span style="font-size:8pt; font-weight:normal;"><a href="{proj.get("url")}" style="color:#475569; text-decoration:none; border-bottom:1px dotted #475569;">Project Link</a></span>' if proj.get("url") else ""}
                    </div>
                    {f'<div class="entry-description" style="line-height:1.5;">{proj.get("description")}</div>' if proj.get("description") else ""}
                </div>
                """

        if education:
            body_content += '<div class="classic-section-title">Education</div>'
            for edu in education:
                body_content += f"""
                <div class="entry">
                    <div class="entry-header">
                        <span>{edu.get('institution')}</span>
                        <span style="font-size: 8.5pt; font-weight: normal; color: #475569;">{edu.get('start_date')} - {edu.get('end_date') or 'Present'}</span>
                    </div>
                    <div class="entry-subheader">
                        <span>{edu.get('degree')} in {edu.get('field_of_study')}</span>
                    </div>
                    {f'<div class="entry-description">{edu.get("description")}</div>' if edu.get("description") else ""}
                </div>
                """

        if skills:
            body_content += f"""
            <div class="classic-section-title">Skills & Expertises</div>
            <div style="font-size: 9pt; color:#334155; line-height: 1.6; margin-top:4px;">
                <strong>Technical Skills:</strong> {", ".join(skills)}
            </div>
            """

        if achievements or certificates:
            body_content += '<div class="classic-section-title">Certificates & Honors</div>'
            cert_list = []
            for cert in certificates:
                cert_list.append(f"{cert.get('name')} ({cert.get('issuer')}, {cert.get('date')})")
            for ach in achievements:
                cert_list.append(f"{ach.get('title')}: {ach.get('description')}")
            
            body_content += f"""
            <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size:9pt; color:#334155; line-height:1.6;">
                {"".join(f'<li>{item}</li>' for item in cert_list)}
            </ul>
            """

        html_body = f"""
        {classic_style}
        <body>
            <div style="padding: 30px;">
                <div class="classic-title">{personal.get('name', 'Anonymous Candidate')}</div>
                <div class="classic-subtitle">{resume_data.get('title', '')}</div>
                <div class="classic-contact">{contacts_str}</div>
                {body_content}
            </div>
        </body>
        """

    else:
        # Minimalist Single Column - MATCHING user's frontend.pdf (strictly white & black)
        body_content = ""
        
        # 1. Skills
        if skills:
            skills_html = " ".join(f'<span class="skill-tag">{s}</span>' for s in skills)
            body_content += f"""
            <div class="section-title">
                <svg class="section-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                Skills
            </div>
            <div class="skills-list" style="margin-bottom: 12px; margin-top: 8px;">
                {skills_html}
            </div>
            """

        # 2. Work History
        if experience:
            body_content += """
            <div class="section-title">
                <svg class="section-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 7H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                Work History
            </div>
            """
            for exp in experience:
                body_content += f"""
                <div class="entry">
                    <div class="entry-header">
                        <span>{exp.get('position')}</span>
                        <span style="font-size: 8.5pt; font-weight: normal; color: #1f2937;">{exp.get('start_date')} - {exp.get('end_date') or 'Present'}</span>
                    </div>
                    <div class="entry-subheader">
                        <span style="color:#000000; font-weight:700;">{exp.get('company')}</span>
                    </div>
                    {f'<div class="entry-description">{exp.get("description")}</div>' if exp.get("description") else ""}
                </div>
                """

        # 3. Key Projects
        if projects:
            body_content += """
            <div class="section-title">
                <svg class="section-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                Key Projects
            </div>
            """
            for proj in projects:
                skills_html = ""
                skills_str = proj.get('skills', '').strip() if proj.get('skills') else ""
                if skills_str:
                    formatted_skills = " | ".join(s.strip() for s in skills_str.split(",") if s.strip()) if "," in skills_str else skills_str
                    if "|" in skills_str:
                        formatted_skills = skills_str
                    skills_html = f'<div style="font-size:8.5pt; color:#4b5563; font-weight:normal; margin-top:2px; margin-bottom:2px;">{formatted_skills}</div>'

                body_content += f"""
                <div class="entry">
                    <div class="entry-header">
                        <span>{proj.get('title')} <span style="font-size:8.5pt; font-weight:normal; color:#4b5563;">({proj.get('role')})</span></span>
                        {f'<span style="font-size:8pt; font-weight:normal;"><a href="{proj.get("url")}" style="color:#000000; text-decoration:underline;">Link</a></span>' if proj.get("url") else ""}
                    </div>
                    {skills_html}
                    {f'<div class="entry-description" style="margin-top:2px;">{proj.get("description")}</div>' if proj.get("description") else ""}
                </div>
                """

        # 4. Education
        if education:
            body_content += """
            <div class="section-title">
                <svg class="section-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.083a11.952 11.952 0 00-6.825-3.026 12.083 12.083 0 01.665-6.479L12 14z"/></svg>
                Education
            </div>
            """
            for edu in education:
                body_content += f"""
                <div class="entry">
                    <div class="entry-header">
                        <span>{edu.get('degree')} in {edu.get('field_of_study')}</span>
                        <span style="font-size: 8.5pt; font-weight: normal; color: #1f2937;">{edu.get('start_date')} - {edu.get('end_date') or 'Present'}</span>
                    </div>
                    <div class="entry-subheader">
                        <span style="color:#000000; font-weight:700;">{edu.get('institution')}</span>
                    </div>
                    {f'<div class="entry-description">{edu.get("description")}</div>' if edu.get("description") else ""}
                </div>
                """

        # 5. Certifications
        if certificates:
            body_content += """
            <div class="section-title">
                <svg class="section-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Certifications
            </div>
            """
            for cert in certificates:
                link_html = f' &nbsp; <a href="{cert.get("url")}" style="color:#000000; text-decoration:underline; font-size:8pt;">Link</a>' if cert.get("url") else ""
                body_content += f"""
                <div class="entry" style="margin-bottom: 6px;">
                    <div class="entry-header">
                        <span><strong>{cert.get('name')}</strong> <span style="font-size:8.5pt; font-weight:normal; color:#4b5563;">({cert.get('issuer')})</span>{link_html}</span>
                        <span style="font-size: 8.5pt; font-weight: normal; color: #1f2937;">{cert.get('date')}</span>
                    </div>
                </div>
                """

        # 6. Achievements
        if achievements:
            body_content += """
            <div class="section-title">
                <svg class="section-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>
                Achievements
            </div>
            """
            for ach in achievements:
                body_content += f"""
                <div class="entry" style="margin-bottom: 6px;">
                    <div class="entry-header">
                        <span><strong>{ach.get('title')}</strong></span>
                    </div>
                    {f'<div class="entry-description">{ach.get("description")}</div>' if ach.get("description") else ""}
                </div>
                """

        # Header Block
        contacts = []
        if personal.get("email"):
            contacts.append(f'<span style="display:inline-flex; align-items:center; gap:4px;"><svg style="width:12px; height:12px; vertical-align:middle;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>&nbsp;{personal.get("email")}</span>')
        if personal.get("phone"):
            contacts.append(f'<span style="display:inline-flex; align-items:center; gap:4px;"><svg style="width:12px; height:12px; vertical-align:middle;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>&nbsp;{personal.get("phone")}</span>')
        if personal.get("location"):
            contacts.append(f'<span style="display:inline-flex; align-items:center; gap:4px;"><svg style="width:12px; height:12px; vertical-align:middle;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>&nbsp;{personal.get("location")}</span>')
        if personal.get("website"):
            contacts.append(f'<span style="display:inline-flex; align-items:center; gap:4px;"><svg style="width:12px; height:12px; vertical-align:middle;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>&nbsp;<a href="{personal.get("website")}" style="color:#4b5563; text-decoration:none;">{personal.get("website")}</a></span>')
        if personal.get("github"):
            contacts.append(f'<span style="display:inline-flex; align-items:center; gap:4px;"><svg style="width:12px; height:12px; vertical-align:middle;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>&nbsp;<a href="{personal.get("github")}" style="color:#4b5563; text-decoration:underline;">GitHub</a></span>')
        if personal.get("linkedin"):
            contacts.append(f'<span style="display:inline-flex; align-items:center; gap:4px;"><svg style="width:12px; height:12px; vertical-align:middle;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>&nbsp;<a href="{personal.get("linkedin")}" style="color:#4b5563; text-decoration:underline;">LinkedIn</a></span>')

        contacts_str = " &nbsp;&nbsp;&nbsp;&nbsp; ".join(contacts)

        html_body = f"""
        <body>
            <div style="padding: 30px;">
                <div style="text-align: left; margin-bottom: 12px;">
                    <h1 style="font-size: 26pt; margin: 0; color: #000000; font-weight: 800; tracking-tight; line-height: 1.1;">{personal.get('name', 'Candidate Name')}</h1>
                    <p style="font-size: 10.5pt; font-weight: 700; color: #000000; margin: 6px 0 12px 0; text-transform: uppercase; letter-spacing: 0.08em;">{resume_data.get('title', '')}</p>
                    <div style="font-size: 8.5pt; color: #4b5563; font-weight: 500; display: flex; flex-wrap: wrap; gap: 15px;">{contacts_str}</div>
                </div>
                <div style="border-bottom: 2.5px solid #000000; margin-bottom: 15px; width: 100%;"></div>
                {body_content}
            </div>
        </body>
        """

    # Wrap the full document
    return f"""<!DOCTYPE html><html>{head}{html_body}</html>"""
