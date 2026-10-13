type Props = {
  title: string;
  description: string;
};

export default function SubpageIntro({ title, description }: Props) {
  return (
    <main id="main" className="js-subpage">
      <div className="js-subpage-content">
        <p className="js-eyebrow">Janczak i Synowie · Żelazków</p>
        <h1 className="js-heading">{title}</h1>
        <p className="js-description">{description}</p>
        <div className="js-separator" aria-hidden="true" />
      </div>
    </main>
  );
}
