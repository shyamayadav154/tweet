import Image from "next/image";
type ProfileImageProps = {
    src?: string | null;
    className?: string;
};
const ProfileImage = ({ src, className }: ProfileImageProps) => {
    return (
        <div
            className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}
        >
            {src == null ? null : (
                <Image
                    src={src}
                    alt="profile Image"
                    priority
                    fill
                    quality={100}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
        </div>
    );
};


export default ProfileImage;
