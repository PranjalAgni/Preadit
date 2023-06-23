import { FC } from "react";

interface PageProps {
  params: {
    slug: string;
  };
}

const Page: FC<PageProps> = ({ params }: PageProps) => {
  return <div>This is the slug {params.slug}</div>;
};

export default Page;
