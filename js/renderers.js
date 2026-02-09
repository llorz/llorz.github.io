/**
 * Rendering utilities for all content types
 */

import { RESOURCE_ICONS, RESOURCE_NAMES } from './config.js';

export class Renderer {
  constructor(data) {
    this.publications = data.publications || [];
    this.collaborators = data.collaborators || {};
    this.venues = data.venues || {};
    this.services = data.services || { committees: [], reviewer: [] };
  }

  // ===== PUBLICATION RENDERING =====
  
  extractYearFromId(id) {
    const yearDigits = id.match(/^(\d{2})_/);
    return yearDigits && yearDigits[1] ? `20${yearDigits[1]}` : 'Unknown';
  }

  extractVenueAbbrFromId(id) {
    const parts = id.split('_');
    return parts.length >= 2 ? parts[1] : '';
  }

  getVenueName(abbr) {
    return this.venues[abbr] || abbr;
  }

  formatAuthors(authors = [], equalContributors = []) {
    if (!authors || authors.length === 0) {
      return '<span class="author">Unknown</span>';
    }

    return authors.map((author, index) => {
      const collaborator = this.collaborators[author];
      const isEqualContributor = equalContributors.includes(author);
      const isSelf = collaborator && collaborator.self === true;
      
      let authorHtml = '';
      
      if (collaborator && collaborator.url) {
        authorHtml = `<a href="${collaborator.url}" class="author-link" target="_blank" rel="noopener">`;
      } else {
        authorHtml = '<span class="author">';
      }
      
      const fullName = collaborator ? collaborator.full_name : author;
      authorHtml += fullName;
      
      if (isEqualContributor) {
        authorHtml += '*';
      }
      
      authorHtml += collaborator && collaborator.url ? '</a>' : '</span>';
      
      if (isSelf) {
        authorHtml = `<span class="author-self">${authorHtml}</span>`;
      }
      
      if (index < authors.length - 1) {
        authorHtml += ', ';
      }
      
      return authorHtml;
    }).join('');
  }

  formatAwardsInline(awards = [], id) {
    if (!awards || awards.length === 0) {
      return '';
    }
    
    return awards.map(award => {
      let awardHtml = '<span class="award-inline">';
      awardHtml += '<i class="fas fa-trophy"></i> ';
      
      if (award.link) {
        awardHtml += `<a href="${award.link}" target="_blank" rel="noopener">${award.name}</a>`;
      } else {
        const awardFile = `/files/${id}_award.pdf`;
        awardHtml += `<a href="${awardFile}" target="_blank">${award.name}</a>`;
      }
      
      awardHtml += '</span>';
      return awardHtml;
    }).join(' ');
  }

  getPublicationImages(publication) {
    const id = publication.id;
    
    if (publication.image_extensions && Array.isArray(publication.image_extensions)) {
      return publication.image_extensions.map(ext => `${id}${ext}`);
    }
    
    const images = [];
    
    for (let i = 1; i <= 2; i++) {
      images.push(`${id}_${i}.png`);
      images.push(`${id}_${i}.jpg`);
      images.push(`${id}_${i}.gif`);
      images.push(`${id}_${i}.jpeg`);
    }
    
    images.push(`${id}.png`);
    images.push(`${id}.jpg`);
    images.push(`${id}.gif`);
    images.push(`${id}.jpeg`);
    
    return images;
  }

  formatResources(id, resources = [], links = {}) {
    const resourceLinks = [];
    
    resources.forEach(resource => {
      const filename = `${id}_${resource}.pdf`;
      const url = `/files/${filename}`;
      resourceLinks.push(`
        <a href="${url}" class="resource-link" data-type="${resource}" target="_blank">
          <i class="fas fa-file-pdf"></i> ${resource.charAt(0).toUpperCase() + resource.slice(1)}
        </a>
      `);
    });
    
    Object.entries(links).forEach(([type, url]) => {
      if (type === 'paper' && resources.includes('paper')) {
        return;
      }
      
      const iconClass = RESOURCE_ICONS[type] || 'fas fa-external-link-alt';
      const displayName = RESOURCE_NAMES[type] || type.charAt(0).toUpperCase() + type.slice(1);
      
      resourceLinks.push(`
        <a href="${url}" class="resource-link" data-type="${type}" target="_blank" rel="noopener">
          <i class="${iconClass}"></i> ${displayName}
        </a>
      `);
    });
    
    if (resourceLinks.length === 0) {
      return '<span class="no-resources">No resources available</span>';
    }
    
    return resourceLinks.join('\n');
  }

  renderPublication(publication) {
    const year = this.extractYearFromId(publication.id);
    const venueAbbr = this.extractVenueAbbrFromId(publication.id);
    const venueName = this.getVenueName(venueAbbr);
    const awardsInline = this.formatAwardsInline(publication.awards, publication.id);
    
    const images = this.getPublicationImages(publication);
    const imagesHtml = images.map(img => 
      `<img src="images/${img}" 
          alt="Publication image" 
          class="publication-image"
          loading="lazy"
          onerror="this.style.display='none'">`
    ).join('');
    
    return `
      <article class="publication" data-year="${year}" id="${publication.id}">
        <div class="publication-content">
          <h3 class="publication-title">${publication.title}</h3>
          
          <div class="publication-authors">
            ${this.formatAuthors(publication.authors, publication.equal_contribution)}
          </div>
          
          <div class="publication-venue">
            <span class="venue-name">${venueName}</span>, 
            <span class="venue-year">${year}</span>
            ${awardsInline ? `<span class="publication-awards-inline">${awardsInline}</span>` : ''}
            ${publication.note ? `<span class="publication-note">${publication.note}</span>` : ''}
          </div>
          
          <div class="publication-links">
            ${this.formatResources(publication.id, publication.resources, publication.links)}
          </div>
        </div>
        
        ${imagesHtml ? `
        <div class="publication-media">
          ${imagesHtml}
        </div>
        ` : ''}
      </article>
    `;
  }

  renderAllPublications() {
    const grouped = {};
    
    this.publications.forEach(publication => {
      const year = this.extractYearFromId(publication.id);
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(publication);
    });
    
    const yearsInOrder = [...new Set(this.publications.map(pub => 
      this.extractYearFromId(pub.id)
    ))];
    
    const uniqueYears = [];
    yearsInOrder.forEach(year => {
      if (!uniqueYears.includes(year)) {
        uniqueYears.push(year);
      }
    });
    
    let html = '';
    
    uniqueYears.forEach(year => {
      const publications = grouped[year];
      if (publications && publications.length > 0) {
        html += `<div class="year-group" id="year-${year}">`;
        html += `<h3 class="year-title">${year}</h3>`;
        
        publications.forEach(publication => {
          html += this.renderPublication(publication);
        });
        
        html += '</div>';
      }
    });
    
    return html;
  }

  // ===== SERVICES RENDERING =====
  
  sortServiceItems(items) {
    if (!items || !Array.isArray(items)) return [];
    
    return [...items].sort((a, b) => {
      const getLargestYear = (item) => {
        if (!item.years || !Array.isArray(item.years) || item.years.length === 0) return 0;
        const years = item.years.map(y => parseInt(y)).filter(y => !isNaN(y));
        return years.length > 0 ? Math.max(...years) : 0;
      };
      
      const yearA = getLargestYear(a);
      const yearB = getLargestYear(b);
      return yearB - yearA;
    });
  }

  splitIntoTwoColumns(items) {
    if (!items || !Array.isArray(items)) return [[], []];
    const half = Math.ceil(items.length / 2);
    return [items.slice(0, half), items.slice(half)];
  }

  formatYears(years) {
    if (!years || !Array.isArray(years) || years.length === 0) return '';
    
    const parsedYears = years
      .map(y => parseInt(y))
      .filter(y => !isNaN(y));
      
    if (parsedYears.length === 0) return '';
    
    const sortedYears = [...parsedYears].sort((a, b) => b - a);
    return sortedYears.map(year => `'${year.toString().slice(2)}`).join(', ');
  }

  renderAcademicServices() {
    const committees = this.sortServiceItems(this.services.committees || []);
    const reviewer = this.sortServiceItems(this.services.reviewer || []);
    const [reviewerCol1, reviewerCol2] = this.splitIntoTwoColumns(reviewer);

    return `
      <div class="services-grid">
        <!-- Program Committees Column -->
        <div class="service-column">
          <div class="service-category">
            <h3>Technical Papers Committee</h3>
            <div class="service-items">
              ${committees.map(item => `
                <div class="service-item">
                  <span class="service-conference">${item.conference || 'Unknown'}</span>
                  <span class="service-years">${this.formatYears(item.years)}</span>
                  ${item.note ? `<span class="service-note">(${item.note})</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Reviewer Column -->
        <div class="service-column">
          <div class="service-category">
            <h3>Reviewer</h3>
            <div class="reviewer-grid">
              <div class="reviewer-column">
                ${reviewerCol1.map(item => `
                  <div class="service-item">
                    <span class="service-conference">${item.conference || 'Unknown'}</span>
                    <span class="service-years">${this.formatYears(item.years)}</span>
                    ${item.note ? `<span class="service-note">(${item.note})</span>` : ''}
                  </div>
                `).join('')}
              </div>
              <div class="reviewer-column">
                ${reviewerCol2.map(item => `
                  <div class="service-item">
                    <span class="service-conference">${item.conference || 'Unknown'}</span>
                    <span class="service-years">${this.formatYears(item.years)}</span>
                    ${item.note ? `<span class="service-note">(${item.note})</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderEducation() {
    const educationData = [
      {
        degree: 'Ph.D. in Computer Science',
        institution: 'KAUST, Visual Computing Center',
        period: '2015 - 2021',
        thesis: 'Shape Matching and Map Space Exploration via Functional Maps',
        thesisLink: 'https://repository.kaust.edu.sa/handle/10754/670353',
        supervisors: [
          { name: 'Peter', collaborator: 'Peter' },
          { name: 'Maks', collaborator: 'Maks' }
        ]
      },
      {
        degree: 'M.Sc. in Financial Mathematics',
        institution: 'University of Oxford',
        period: '2014 - 2015'
      },
      {
        degree: 'B.Sc. in Mathematics and Applied Mathematics',
        institution: 'Zhejiang University',
        period: '2010 - 2014'
      }
    ];
    
    return educationData.map(edu => {
      // Build supervisors HTML if they exist
      let supervisorsHtml = '';
      if (edu.supervisors) {
        const supervisorLinks = edu.supervisors.map(sup => {
          const collaborator = this.collaborators[sup.collaborator];
          const title = collaborator?.title || '';
          const fullName = collaborator?.full_name || sup.name;
          const displayName = title ? `${title} ${fullName}` : fullName;
          
          // Create actual <a> tag if URL exists, otherwise just text
          if (collaborator?.url) {
            return `<a href="${collaborator.url}" class="collaborator-link" target="_blank" rel="noopener noreferrer">${displayName}</a>`;
          } else {
            return `<span>${displayName}</span>`;
          }
        }).join(' and ');
        
        supervisorsHtml = `
          <div class="edu-supervisors">
            <strong>Supervisors:</strong> ${supervisorLinks}
          </div>
        `;
      }
      
      // Build thesis HTML if it exists
      let thesisHtml = '';
      if (edu.thesis) {
        thesisHtml = `
          <div class="edu-thesis">
            <strong>Thesis:</strong> 
            ${edu.thesisLink ? 
              `<a href="${edu.thesisLink}" class="thesis-link" target="_blank" rel="noopener noreferrer">${edu.thesis}</a>` :
              edu.thesis
            }
          </div>
        `;
      }
      
      return `
        <div class="education-item">
          <div class="edu-details">
            <div class="edu-degree">${edu.degree}</div>
            <div class="edu-institution">${edu.institution}</div>
            <div class="edu-period-details">
              <div class="edu-period">${edu.period}</div>
              ${thesisHtml}
              ${supervisorsHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }


  renderResearchExperience(researchExperience) {
    if (!researchExperience || !Array.isArray(researchExperience)) {
      return '<p class="no-data">No research experience found.</p>';
    }

    const sortedExperience = [...researchExperience].sort((a, b) => {
      const getStartYear = (period) => {
        if (!period) return 0;
        const match = period.match(/(\d{4})/);
        return match ? parseInt(match[1]) : 0;
      };
      return getStartYear(b.period) - getStartYear(a.period);
    });

    return sortedExperience.map(exp => {
      let advisorHtml = '';
      if (exp.advisor && this.collaborators[exp.advisor]) {
        const collaborator = this.collaborators[exp.advisor];
        const title = collaborator.title || '';
        const displayName = title ? `${title} ${collaborator.full_name}` : collaborator.full_name;
        
        // Create actual <a> tag if URL exists, otherwise just text
        if (collaborator.url) {
          advisorHtml = `Advised by <a href="${collaborator.url}" class="collaborator-link" target="_blank" rel="noopener noreferrer">${displayName}</a>`;
        } else {
          advisorHtml = `Advised by <span>${displayName}</span>`;
        }
      } else if (exp.note) {
        advisorHtml = exp.note;
      }
      
      return `
        <div class="experience-item">
          <div class="exp-details">
            <div class="exp-title">${exp.title || ''}</div>
            <div class="exp-institution-lab">
              <span class="exp-institution">${exp.institution || 'Unknown'}</span>
              ${exp.lab ? `<span class="exp-lab">${exp.lab}</span>` : ''}
              ${exp.department ? `<span class="exp-lab">${exp.department}</span>` : ''}
            </div>
            <div class="exp-period-note">
              ${exp.period ? `<span class="exp-period">${exp.period}</span>` : ''}
              ${advisorHtml ? `<span class="exp-note">${advisorHtml}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}