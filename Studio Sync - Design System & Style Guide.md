# **Studio Sync \- Design System & Style Guide**

## **1\. Design Philosophy**

"Digital Editorial"  
The aesthetic is inspired by high-end editorial design rather than typical SaaS tools. It emphasizes readability, warmth, and clarity. It replaces clinical grays with warm creams and uses Serif typography to establish authority and calm.

## **2\. Color Palette**

### **A. Base & Neutrals**

The foundation of the interface avoids pure \#FFFFFF and \#000000 to reduce eye strain.

| Token | Hex | Usage |
| :---- | :---- | :---- |
| bg-canvas | \#F9F8F6 | Main application background (Warm Cream) |
| bg-surface | \#FFFFFF | Cards, Modals, Input fields |
| bg-subtle | \#FAFAFA | Table headers, secondary backgrounds |
| border-main | \#E6E4DF | Structural borders (Sidebar, Header) |
| text-primary | \#191919 | Headings, Main body text (Soft Black) |
| text-secondary | \#595959 | Meta-data, labels, descriptions |

### **B. Brand Accents**

Used sparingly for key interactions and branding.

| Token | Hex / Tailwind | Usage |
| :---- | :---- | :---- |
| brand-gradient | from-\[\#4A5DFF\] to-\[\#FF7A5C\] | Logo, Key branding elements |
| action-primary | \#191919 | Primary Buttons (Black) |
| focus-ring | blue-100 / blue-400 | Input focus states |
| ai-sparkle | purple-600 / purple-50 | AI/Gemini features |

### **C. Semantic / Status Colors**

Used for Status Badges and feedback.

| Status | Background | Text | Border |
| :---- | :---- | :---- | :---- |
| **DECIDED** | \#D1F4E6 (Mint) | \#0F5B3E | \#B8EAD9 |
| **IN REVIEW** | \#FFF4D6 (Butter) | \#8A6A1C | \#FCE6B3 |
| **DRAFT** | \#F2F2F2 (Gray) | \#595959 | \#E6E4DF |
| **DEPRECATED** | \#FFEBEB (Rose) | \#C92A2A | \#FCD6D6 |
| **ACTIVE** | blue-50 | blue-700 | blue-100 |

## **3\. Typography**

### **Font Families**

* **Headings:** font-serif (System Serif / Times / Georgia)  
  * Used for: Project Titles, Page Headers, "Executive Summary".  
  * *Rationale:* Gives the tool a "document" feel rather than an "app" feel.  
* **Interface:** font-sans (System Sans / Inter / San Francisco)  
  * Used for: Table data, Buttons, Inputs, Sidebar links.  
  * *Rationale:* Ensures high legibility at small sizes (12px-14px).

### **Scale**

* **Display:** text-3xl \+ font-medium (Project Details Title)  
* **H1:** text-2xl \+ font-medium (Page Titles)  
* **H2:** text-lg \+ font-medium (Card Titles, Modal Headers)  
* **Body:** text-sm (Standard UI text)  
* **Caption:** text-xs \+ uppercase \+ tracking-wider (Labels, Column Headers)

## **4\. Component Library**

### **Buttons**

1. **Primary:**  
   * Style: bg-\[\#191919\] text-white rounded-lg shadow-md hover:bg-black  
   * Usage: "New Decision", "Create Project", "Done".  
2. **Secondary:**  
   * Style: bg-white text-gray-700 border border-gray-200 hover:bg-gray-50  
   * Usage: "Cancel", "Load Example Data".  
3. **AI Action:**  
   * Style: bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100  
   * Icon: Always includes \<Sparkles /\>.  
4. **Navigation (Pill):**  
   * Style: rounded-full px-4 py-2 text-sm font-medium  
   * Active: bg-\[\#191919\] text-white  
   * Inactive: text-gray-500 hover:bg-gray-100

### **Cards (Project)**

* **Container:** bg-white rounded-xl border border-\[\#E6E4DF\] p-6  
* **Interaction:** hover:shadow-md hover:border-blue-300 transition-all duration-200  
* **Icon:** 40x40px rounded container with gradient background (blue-50 to indigo-50).

### **Inputs (Editable Cells)**

* **Idle State:** Transparent background, hover shows gray background.  
* **Editing State:** bg-white border border-blue-400 shadow-sm outline-none.  
* **Text Area:** resize-none min-h-\[80px\].

### **Modals**

* **Backdrop:** bg-black/40 backdrop-blur-sm (Glassmorphism effect).  
* **Container:** bg-white rounded-xl shadow-2xl.  
* **Header:** bg-\[\#FAFAFA\] border-b border-gray-100.  
* **Animation:** animate-in fade-in zoom-in duration-200.

## **5\. Layout & Spacing**

### **Grid System**

* **Project Grid:** Responsive grid ranging from 1 column (mobile) to 4 columns (XL screens).  
* **Table Layout:**  
  * Fixed width for status/actions.  
  * Fluid width (min-w-\[350px\]) for text-heavy columns (Rationale, Decisions).

### **Spacing Tokens**

* **Page Padding:** p-4 (mobile) to p-8 (desktop).  
* **Element Separation:** gap-4 (standard), gap-6 (sections).  
* **Corner Radius:**  
  * rounded-xl (Cards, Modals, Tables)  
  * rounded-lg (Buttons, Inputs)  
  * rounded-md (Badges)

## **6\. Motion & Interaction**

* **Transitions:** transition-all duration-200 is the default for hover states.  
* **Feedback:** Buttons have active:scale-95 (tactile click feel).  
* **Entrance:** Views use animate-in slide-in-from-bottom-4 fade-in to feel smooth and organic.