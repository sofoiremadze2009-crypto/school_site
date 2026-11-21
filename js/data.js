/* =========================================================
   js/data.js — მონაცემები და საცავი (იტვირთება ყველაზე ადრე)
   ---------------------------------------------------------
   შიგთავსი:
   1. schoolData       – საწყისი ტექსტები და ჩანაწერები (დირექტორი, პედაგოგები,
                         სიახლეები, წიგნები, ექსკურსიები, კლუბები, იდეები)
   2. SCHOOL_SECTIONS  – ადმინის 9 სექციის სია. თითო სექციას აქვს:
                         key (localStorage-ის გასაღები), label (სახელი ადმინში),
                         box (კონტეინერის ID index.html-ში), card (ბარათის კლასი),
                         image/gallery (ფოტო ან გალერეა), extra (დამატებითი ველი)
   3. SchoolStore      – წაკითხვა/ჩაწერა localStorage-ში (has, read, write)
   იყენებს: app.js (index.html-ზე) და admin.js (admin.html-ზე)
   რა სად შევცვალო:
   - ბარათის ფერი  → SCHOOL_SECTIONS-ში card: 'card' (მუქი მწვანე)
                     ან 'news-card' / 'teacher-card' / 'book-card' (თეთრი)
   - კონტეინერის ID index.html-ში შეიცვალა → შესაბამისი box
   - საწყისი ჩანაწერები → schoolData
   ========================================================= */
const schoolData = {
  history: "დაბა ნასაკირალის საჯარო სკოლა ორიენტირებულია თითოეული მოსწავლის აკადემიურ, შემოქმედებით და პიროვნულ განვითარებაზე, თანამედროვე სტანდარტების შესაბამისად.",
  director: {
    name: "ნინო დუმბაძე",
    bio: "სკოლის დირექტორი მრავალწლიანი სამუშაო და მართვის გამოცდილებით."
  },
  teachers: [
    { name: "მარინა შანიძე", subject: "ქართული ენა და ლიტერატურა" },
    { name: "გიორგი მჟავანაძე", subject: "მათემატიკა" },
    { name: "ია ბარამიძე", subject: "ინგლისური ენა" },
    { name: "ლელა გოგიტიძე", subject: "ისტორია" }
  ],
  news: [
    { title: "ახალი სასწავლო წლის დასაწყისი", category: "სიახლე", description: "სკოლამ განახლებული ინფრასტრუქტურითა და ენერგიით მიიღო მოსწავლეები." },
    { title: "წარმატება ოლიმპიადაში", category: "მიღწევა", description: "ჩვენი სკოლის მოსწავლეებმა საოლქო ტურში საპრიზო ადგილები დაიკავეს." }
  ],
  achievements: [
    { title: "სპორტული მიღწევები", description: "გამარჯვება მუნიციპალურ ტურნირში ფეხბურთსა და კალათბურთში." },
    { title: "ინტელექტუალური კლუბი", description: "პირველი ადგილი რეგიონულ „რა? სად? როდის?“ ჩემპიონატში." }
  ],
  books: [
    { title: "ვეფხისტყაოსანი", author: "შოთა რუსთაველი", description: "ქართული კლასიკური ლიტერატურის შედევრი." },
    { title: "გერი", author: "ვაჟა-ფშაველა", description: "ფილოსოფიური პოემები და მოთხრობები." },
    { title: "დიდოსტატის მარჯვენა", author: "კონსტანტინე გამსახურდია", description: "ისტორიული რომანი საქართველოს წარსულზე." }
  ],
  excursions: [
    { title: "შემეცნებითი გასვლა ბათუმში", description: "მოსწავლეებმა მოინახულეს ბოტანიკური ბაღი და მუზეუმები." },
    { title: "ისტორიული ტური გურიაში", description: "გასვლა ადგილობრივ კულტურულ ძეგლებთან." }
  ],
  clubs: [
    { name: "ახალგაზრდა პროგრამისტები", description: "ვებ-ტექნოლოგიებისა და ძირითადი პროგრამირების შესწავლა." },
    { name: "ეკო-კლუბი მწვანე მომავალი", description: "გარემოს დაცვითი აქტივობები და ეკოლოგიური პროექტები." }
  ],
  ideas: [
    { author: "მარიამი (XI კლასი)", text: "კარგი იქნება სკოლის ეზოში მოსასვენებელი ზონისა და ბიბლიოთეკის ღია სივრცის მოწყობა.", date: "15.11.2026" }
  ]
};

/* ---------------------------------------------------------
   სექციების ერთიანი კონფიგურაცია (იყენებს admin.js და app.js)
   box  – კონტეინერი index.html-ში
   card – ბარათის CSS კლასი (white: news-card/teacher-card/book-card, dark: card)
   --------------------------------------------------------- */
const SCHOOL_SECTIONS = [
  { key: 'school_news',         label: 'ბოლო სიახლეები',           box: '#homeNewsList',         card: 'card',    image: true, extra: { name: 'category', label: 'კატეგორია (მაგ. სიახლე)' } },
  { key: 'school_achievements', label: 'მოსწავლეთა მიღწევები',     box: '#achievementsGrid', card: 'card',         image: true },
  { key: 'school_management',   label: 'სკოლის დირექცია',          box: '#aboutDirectorBox',   card:'card',         image: true },
  { key: 'school_teachers',     label: 'პედაგოგიური კოლექტივი',    box: '#teachersGrid',     card: 'teacher-card', image: true, extra: { name: 'subject', label: 'საგანი' } },
  { key: 'school_books',        label: 'სასკოლო ბიბლიოთეკა',       box: '#libraryBooksGrid',        card:'card',    extra: { name: 'author', label: 'ავტორი' }, textLabel: 'აღწერა ან ბმული' },
  { key: 'school_trips',       label: 'ექსკურსიები და გასვლები',  box: '#excursionsGrid',        card: 'card',         gallery: true },
  { key: 'school_clubs',       label: 'კლუბები და თვითმმართველობა', box: '#clubsGrid',      card: 'card' },
  { key: 'school_olympiads',   label: 'ოლიმპიადები და რესურსები', box: '#olympiadsGrid',    card: 'card' },
  { key: 'school_ideas',       label: 'მოსწავლეთა იდეები',        readonly: true }
];

/* ---------------------------------------------------------
   მონაცემთა საცავი: localStorage, ხოლო სანამ ადმინი არაფერს შეცვლის,
   საწყისი მონაცემები schoolData-დან. ძველი ფორმატები (name/desc/description)
   ავტომატურად გადაიყვანება title/text-ზე.
   --------------------------------------------------------- */
const SchoolStore = {
  defaults(key) {
    const d = schoolData;
    switch (key) {
      case 'school_news':         return d.news.map(n => ({ title: n.title, category: n.category, text: n.description }));
      case 'school_achievements': return d.achievements.map(a => ({ title: a.title, text: a.description }));
      case 'school_management':   return [{ title: d.director.name, text: d.director.bio }];
      case 'school_teachers':     return d.teachers.map(t => ({ title: t.name, subject: t.subject, text: '' }));
      case 'school_books':        return d.books.map(b => ({ title: b.title, author: b.author, text: b.description }));
      case 'school_trips':        return d.excursions.map(e => ({ title: e.title, text: e.description }));
      case 'school_clubs':        return d.clubs.map(c => ({ title: c.name, text: c.description }));
      case 'school_ideas':        return d.ideas.map(i => Object.assign({}, i));
      default:                    return [];
    }
  },

  norm(it, i) {
    const o = Object.assign({}, it);
    if (o.title === undefined) o.title = o.name || '';
    if (o.text === undefined) o.text = o.desc || o.description || '';
    if (o.id === undefined) o.id = 'l' + i;
    return o;
  },

  has(key) {
    try { return localStorage.getItem(key) !== null; } catch (e) { return false; }
  },

  read(key) {
    let list = null;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) list = JSON.parse(raw);
    } catch (e) {}
    if (!Array.isArray(list)) list = this.has(key) ? [] : this.defaults(key);
    return list.map((it, i) => this.norm(it, i));
  },

  write(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }
};