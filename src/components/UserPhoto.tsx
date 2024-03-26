import { Image, IImageProps } from "native-base"

type IUserPhotoProps = IImageProps & {
  size: number
}

export function UserPhoto({ size, ...rest }: IUserPhotoProps) {
  return (
    <Image
      rounded="full"
      borderWidth={2}
      borderColor="gray.400"
      w={size}
      h={size}
      {...rest}
    />
  )
}