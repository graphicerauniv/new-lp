// assets/js/schema-generator.js

fetch("/lp/assets/etc/courses.json")
  .then(res => res.json())
  .then(courses => {
    const schemaData = [];

    /* =========================
       1. Organization Schema
    ========================== */
    schemaData.push({
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      "name": "Graphic Era University",
      "url": "https://d31y9ahtp1d97e.cloudfront.net/",
      "logo": "https://d31y9ahtp1d97e.cloudfront.net/assets/img/main/logo.svg",
      "sameAs": [
        "https://www.facebook.com/GraphicEraDeemedUniversity",
        "https://twitter.com/GraphicEraUni",
        "https://www.linkedin.com/school/graphic-era-university/"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "566/6 Bell Road, Clement Town",
        "addressLocality": "Dehradun",
        "addressRegion": "Uttarakhand",
        "postalCode": "248002",
        "addressCountry": "IN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-135-2642727",
        "contactType": "Admissions"
      }
    });

    /* =========================
       2. Breadcrumb Schema
    ========================== */
    schemaData.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://d31y9ahtp1d97e.cloudfront.net/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Admissions",
          "item": "https://d31y9ahtp1d97e.cloudfront.net/admissions"
        }
      ]
    });

    /* =========================
       3. FAQ Schema
    ========================== */
    schemaData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What courses are offered at Graphic Era University?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Graphic Era University offers undergraduate, postgraduate, and doctoral programs in Engineering, Management, Computer Applications, Life Sciences, and Humanities."
          }
        },
        {
          "@type": "Question",
          "name": "Does Graphic Era University provide hostel facilities?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, the university provides separate hostel facilities for boys and girls with Wi-Fi, security, and mess facilities."
          }
        }
      ]
    });

    /* =========================
       4. Course List (ItemList)
    ========================== */
    const courseList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Courses offered by Graphic Era University",
      "itemListElement": courses.map((course, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": course.name,
        "url": "https://d31y9ahtp1d97e.cloudfront.net/admissions"
      }))
    };

    schemaData.push(courseList);

    /* =========================
       Inject JSON-LD
    ========================== */
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(script);
  })
